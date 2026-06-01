from flask import Flask, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "jwt-secret-key")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 3600))
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///crop_disease.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["MAX_CONTENT_LENGTH"] = int(os.getenv("MAX_UPLOAD_SIZE", 16777216))

# Initialize extensions
CORS(app, origins=os.getenv("CORS_ORIGINS", "http://localhost:5173"))

from extensions import db, jwt
db.init_app(app)
jwt.init_app(app)

# Import models so SQLalchemy is aware of their metadata before creating tables
from models.user import User
from models.prediction import Prediction

# Import and register blueprints
from routes.prediction import prediction_bp
from routes.auth import auth_bp
app.register_blueprint(prediction_bp)
app.register_blueprint(auth_bp)

# Routes
@app.route("/")
def home():
    return jsonify({
        "message": "Crop Disease Detection API",
        "status": "running",
        "version": "1.0.0"
    })

@app.route("/health")
def health():
    return jsonify({"status": "healthy"})

# Create database tables
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
