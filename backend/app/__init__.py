import os
from flask import Flask, jsonify
from dotenv import load_dotenv

from app.extensions import db, migrate
from sqlalchemy import text

load_dotenv()

def create_app():
    app = Flask(__name__)

    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)
    migrate.init_app(app, db)

    from app import models 

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
