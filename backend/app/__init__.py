import os
from flask import Flask, jsonify
from dotenv import load_dotenv
from flask_cors import CORS
from sqlalchemy import text

from app.extensions import db, migrate, login_manager
from app.routes import register_routes
from app.models import User

load_dotenv()


def create_app():
    app = Flask(__name__)

    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    app.config["SESSION_COOKIE_HTTPONLY"] = True
    app.config["SESSION_COOKIE_SAMESITE"] = os.getenv("COOKIE_SAMESITE", "Lax")
    app.config["SESSION_COOKIE_SECURE"] = os.getenv("COOKIE_SECURE", "0") == "1"

    cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173")
    CORS(app, supports_credentials=True, origins=[o.strip() for o in cors_origins.split(",")])

    db.init_app(app)
    migrate.init_app(app, db)

    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id: str):
        return User.query.get(int(user_id))

    register_routes(app)

    @app.get("/health")
    def health():
        return jsonify({"status": "ok", "service": "backend"}), 200

    @app.get("/health/db")
    def health_db():
        try:
            with db.engine.connect() as conn:
                result = conn.execute(text("SELECT 1;")).scalar()
            return jsonify({"status": "ok", "service": "db", "result": result}), 200
        except Exception as e:
            return jsonify({"status": "error", "service": "db", "message": str(e)}), 500

    return app
