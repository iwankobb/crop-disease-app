from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models.user import User
from extensions import db
import re

auth_bp = Blueprint('auth', __name__)

# Basic email regex validation helper
EMAIL_REGEX = re.compile(r"[^@]+@[^@]+\.[^@]+")

@auth_bp.route('/api/auth/signup', methods=['POST'])
def signup():
    """Register a new user"""
    data = request.get_json() or {}
    
    username = data.get('username', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')
    
    # Input validation
    if not username or not email or not password:
        return jsonify({"success": False, "error": "Missing required fields"}), 400
        
    if len(password) < 6:
        return jsonify({"success": False, "error": "Password must be at least 6 characters long"}), 400
        
    if not EMAIL_REGEX.match(email):
        return jsonify({"success": False, "error": "Invalid email address format"}), 400
        
    try:
        # Check if username or email already exists
        if User.query.filter_by(username=username).first():
            return jsonify({"success": False, "error": "Username is already taken"}), 400
            
        if User.query.filter_by(email=email).first():
            return jsonify({"success": False, "error": "Email is already registered"}), 400
            
        # Create user
        new_user = User(username=username, email=email, is_admin=False)
        new_user.set_password(password)
        
        # Save to database
        db.session.add(new_user)
        db.session.commit()
        
        # Generate JWT access token (use string representation of ID as identity)
        access_token = create_access_token(identity=str(new_user.id))
        
        return jsonify({
            "success": True,
            "message": "User registered successfully",
            "token": access_token,
            "user": new_user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": f"Database error: {str(e)}"}), 500

@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    """Authenticate an existing user and return a JWT"""
    data = request.get_json() or {}
    
    identifier = data.get('identifier', '').strip()  # Can be username or email
    password = data.get('password', '')
    
    if not identifier or not password:
        return jsonify({"success": False, "error": "Missing identifier or password"}), 400
        
    try:
        # Query by email or username
        user = User.query.filter((User.username == identifier) | (User.email == identifier)).first()
        
        if not user or not user.check_password(password):
            return jsonify({"success": False, "error": "Invalid credentials"}), 401
            
        # Generate token
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            "success": True,
            "message": "Logged in successfully",
            "token": access_token,
            "user": user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "error": f"Authentication error: {str(e)}"}), 500

@auth_bp.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_profile():
    """Retrieve details of the currently logged-in user"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        
        if not user:
            return jsonify({"success": False, "error": "User not found"}), 404
            
        return jsonify({
            "success": True,
            "user": user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
