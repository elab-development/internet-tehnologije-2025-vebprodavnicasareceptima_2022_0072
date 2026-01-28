from flask import Blueprint
from app.middlewares.auth import require_auth, require_role
from app.controllers.order_controller import (
    create_order, list_orders, get_order, cancel_order, admin_update_status
)

orders_bp = Blueprint("orders", __name__, url_prefix="/api/orders")


orders_bp.post("")(require_role("user")(create_order))
orders_bp.get("")(require_auth(list_orders))
orders_bp.get("/<int:order_id>")(require_auth(get_order))

orders_bp.post("/<int:order_id>/cancel")(require_role("user")(cancel_order))
orders_bp.put("/<int:order_id>/status")(require_role("admin")(admin_update_status))
