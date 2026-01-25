from flask import Blueprint
from app.controllers.product_controller import (
    create_product,
    update_product,
    delete_product,
    list_products,
    get_product,
)
from app.middlewares.auth import require_role

products_bp = Blueprint("products", __name__, url_prefix="/api/products")

products_bp.get("")(list_products)
products_bp.get("/<int:product_id>")(get_product)

products_bp.post("")(require_role("admin")(create_product))
products_bp.put("/<int:product_id>")(require_role("admin")(update_product))
products_bp.delete("/<int:product_id>")(require_role("admin")(delete_product))
