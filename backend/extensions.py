from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager

# Centralize our SQLAlchemy and JWTManager instances to prevent duplicate registration
# and database metadata mapping errors across different blueprint models.
db = SQLAlchemy()
jwt = JWTManager()
