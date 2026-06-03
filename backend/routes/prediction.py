from flask import Blueprint, request, jsonify, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
import uuid
import time
from functools import wraps
from extensions import db
from models.prediction import Prediction

prediction_bp = Blueprint('prediction', __name__)

# In-memory store for rate limiting: { ip_address: [timestamp1, timestamp2, ...] }
RATE_LIMIT_STORE = {}

def rate_limit(limit=10, period=60):
    """Lightweight in-memory rate limiter to protect expensive AI routes"""
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            ip = request.remote_addr
            now = time.time()
            
            if ip not in RATE_LIMIT_STORE:
                RATE_LIMIT_STORE[ip] = []
                
            # Filter out timestamps older than the rate limit period
            RATE_LIMIT_STORE[ip] = [t for t in RATE_LIMIT_STORE[ip] if now - t < period]
            
            if len(RATE_LIMIT_STORE[ip]) >= limit:
                return jsonify({
                    "success": False,
                    "error": "Rate limit exceeded. Please wait before submitting another scan."
                }), 429
                
            RATE_LIMIT_STORE[ip].append(now)
            return f(*args, **kwargs)
        return wrapped
    return decorator

# Allowed image extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@prediction_bp.route('/api/predict', methods=['POST'])
@jwt_required()
@rate_limit(limit=10, period=60) # Protect this expensive AI route from spam
def predict():
    """Disease detection API"""
    # Check if image exists
    if 'image' not in request.files:
        return jsonify({"success": False, "error": "No image provided"}), 400
    
    file = request.files['image']
    
    if file.filename == '':
        return jsonify({"success": False, "error": "No image selected"}), 400
    
    if not allowed_file(file.filename):
        return jsonify({"success": False, "error": "Invalid file type. Supported: PNG, JPG, JPEG, WEBP"}), 400
    
    try:
        # Read image bytes
        image_bytes = file.read()
        
        # Check file size (16MB max)
        max_size = int(os.getenv("MAX_UPLOAD_SIZE", 16777216))
        if len(image_bytes) > max_size:
            return jsonify({"success": False, "error": "Image too large (max 16MB)"}), 400
        
        # Run AI inference
        from services.ai_service import ai_service
        result = ai_service.predict(image_bytes)
        
        if not result["success"]:
            return jsonify(result), 400
        
        # Save prediction and image to local database/disk
        try:
            user_id = int(get_jwt_identity())
            
            # Create a unique filename to prevent filename collisions
            ext = file.filename.rsplit('.', 1)[1].lower()
            unique_filename = f"{uuid.uuid4().hex}.{ext}"
            
            # Ensure upload folder exists
            upload_dir = os.path.join(os.getcwd(), 'uploads')
            os.makedirs(upload_dir, exist_ok=True)
            
            # Save file to upload directory
            filepath = os.path.join(upload_dir, unique_filename)
            with open(filepath, 'wb') as f:
                f.write(image_bytes)
            
            # Create prediction database record
            prediction_record = Prediction(
                user_id=user_id,
                image_filename=unique_filename,
                crop_type=result["crop_type"],
                disease=result["disease"],
                confidence=result["confidence"],
                is_healthy=result["is_healthy"]
            )
            
            db.session.add(prediction_record)
            db.session.commit()
            
            # Enrich return payload with DB and file system keys
            result["id"] = prediction_record.id
            result["image_url"] = f"/api/uploads/{unique_filename}"
            
        except Exception as db_err:
            db.session.rollback()
            # We print the database error but do not fail the request since AI prediction was successful
            print(f"Database error saving scan: {str(db_err)}")
            result["db_error"] = "AI evaluated successfully, but failed to save in historical records."
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@prediction_bp.route('/api/predictions/history', methods=['GET'])
@jwt_required()
def get_history():
    """Retrieve predicting history for current logged-in user"""
    try:
        user_id = int(get_jwt_identity())
        
        # Fetch predictions, ordered by newest first
        scans = Prediction.query.filter_by(user_id=user_id).order_by(Prediction.created_at.desc()).all()
        
        history_list = []
        for scan in scans:
            scan_dict = scan.to_dict()
            scan_dict["image_url"] = f"/api/uploads/{scan.image_filename}"
            history_list.append(scan_dict)
            
        return jsonify({
            "success": True,
            "history": history_list
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@prediction_bp.route('/api/uploads/<filename>', methods=['GET'])
def serve_upload(filename):
    """Retrieve uploaded images securely, preventing directory traversal"""
    # Block directory traversal attacks (e.g. filename contains '..')
    if ".." in filename or filename.startswith("/") or filename.startswith("\\"):
        return jsonify({"success": False, "error": "Invalid file access format"}), 400
        
    safe_name = secure_filename(filename)
    if not safe_name or safe_name != filename:
        return jsonify({"success": False, "error": "Invalid file access format"}), 400
        
    upload_dir = os.path.join(os.getcwd(), 'uploads')
    return send_from_directory(upload_dir, safe_name)

@prediction_bp.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "prediction"})
