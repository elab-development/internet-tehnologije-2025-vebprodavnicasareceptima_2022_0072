from flask import Blueprint
from app.middlewares.auth import require_role
from app.controllers.admin_controller import admin_overview

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

admin_bp.get("/overview")(require_role("admin")(admin_overview))