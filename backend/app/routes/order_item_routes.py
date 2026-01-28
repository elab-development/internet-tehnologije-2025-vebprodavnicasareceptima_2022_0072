from flask import Blueprint
from app.middlewares.auth import require_auth
from app.controllers.order_item_controller import (
    list_order_items, update_order_item
)

order_items_bp = Blueprint("order_items", __name__, url_prefix="/api/order-items")

order_items_bp.get("")(require_auth(list_order_items))
order_items_bp.put("/<int:item_id>")(require_auth(update_order_item))
