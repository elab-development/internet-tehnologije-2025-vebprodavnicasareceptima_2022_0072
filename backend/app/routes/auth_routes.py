from flask import Blueprint
from app.controllers.auth_controller import register, login, logout, me

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

auth_bp.post("/register")(register)
auth_bp.post("/login")(login)
auth_bp.post("/logout")(logout)
auth_bp.get("/me")(me)
