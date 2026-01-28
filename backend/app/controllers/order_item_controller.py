from flask import request, jsonify
from sqlalchemy.exc import IntegrityError
from flask_login import current_user

from app.extensions import db
from app.models import Order, OrderItem, Product
from app.middlewares.order_rules import is_final_status


def list_order_items():
    """
    Query param: orderId (obavezno)
    - user: samo ako je to njegov order
    - admin: bilo koji
    """
    order_id = request.args.get("orderId")
    if not order_id:
        return jsonify({"error": "orderId query param is required."}), 400

    try:
        oid = int(order_id)
    except ValueError:
        return jsonify({"error": "orderId must be an integer."}), 400

    order = Order.query.get(oid)
    if not order:
        return jsonify({"error": "Order not found."}), 404

    role = (current_user.role or "").lower()
    if role == "user" and order.user_id != current_user.id:
        return jsonify({"error": "Forbidden"}), 403

    items = OrderItem.query.filter(OrderItem.order_id == oid).all()

    return jsonify({
        "items": [
            {
                "id": it.id,
                "order_id": it.order_id,
                "product_id": it.product_id,
                "product_name": it.product.name,
                "quantity": it.quantity,
                "price_at_purchase": str(it.price_at_purchase),
            }
            for it in items
        ],
        "count": len(items),
        "orderId": oid,
    }), 200


def update_order_item(item_id: int):
    """
    Auth required.
    Može da menja samo quantity.
    - user: samo ako je item u njegovom orderu
    - admin: bilo koji
    Ali samo ako order nije finalan (PAID/COMPLETED/CANCELLED).
    """
    item = OrderItem.query.get(item_id)
    if not item:
        return jsonify({"error": "OrderItem not found."}), 404

    order = Order.query.get(item.order_id)
    if not order:
        return jsonify({"error": "Order not found."}), 404

    role = (current_user.role or "").lower()
    if role == "user" and order.user_id != current_user.id:
        return jsonify({"error": "Forbidden"}), 403

    if is_final_status(order.status):
        return jsonify({"error": "Cannot update items for final orders."}), 400

    data = request.get_json(silent=True) or {}
    if "quantity" not in data:
        return jsonify({"error": "quantity is required."}), 400

    try:
        qty = int(data.get("quantity"))
    except (TypeError, ValueError):
        return jsonify({"error": "quantity must be an integer."}), 400

    if qty <= 0:
        return jsonify({"error": "quantity must be > 0."}), 400

    product = Product.query.get(item.product_id)
    if product and product.stock < qty:
        return jsonify({"error": f"Not enough stock for product '{product.name}'."}), 400

    item.quantity = qty

    total = 0
    for it in order.items:
        total += float(it.price_at_purchase) * it.quantity
    order.total_price = total

    db.session.commit()

    return jsonify({"message": "Order item updated."}), 200
