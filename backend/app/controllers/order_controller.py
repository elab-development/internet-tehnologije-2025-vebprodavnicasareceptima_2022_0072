from decimal import Decimal
from flask import request, jsonify
from sqlalchemy import asc, desc
from sqlalchemy.exc import IntegrityError
from flask_login import current_user

from app.extensions import db
from app.models import Order, OrderItem, Product
from app.middlewares.order_rules import FINAL_STATUSES, is_final_status

ALLOWED_SORT = {"total_price", "created_at"}
ALLOWED_DIR = {"asc", "desc"}
ALLOWED_STATUS = {"PENDING", "PROCESSING", "PAID", "COMPLETED", "CANCELLED"}


def _calc_total(order: Order) -> Decimal:
    total = Decimal("0.00")
    for it in order.items:
        total += Decimal(str(it.price_at_purchase)) * it.quantity
    return total


def create_order():
    """
    User-only. Body: { items: [ {product_id, quantity}, ... ] }
    price_at_purchase uzimamo iz Product.price
    total_price se računa.
    """
    data = request.get_json(silent=True) or {}
    items = data.get("items") or []

    if not isinstance(items, list) or len(items) == 0:
        return jsonify({"error": "Items must be a non-empty array."}), 400

    parsed = []
    for it in items:
        if not isinstance(it, dict):
            return jsonify({"error": "Each item must be an object."}), 400
        pid = it.get("product_id")
        qty = it.get("quantity")

        try:
            pid = int(pid)
        except (TypeError, ValueError):
            return jsonify({"error": "product_id must be an integer."}), 400

        try:
            qty = int(qty)
        except (TypeError, ValueError):
            return jsonify({"error": "quantity must be an integer."}), 400

        if qty <= 0:
            return jsonify({"error": "quantity must be > 0."}), 400

        parsed.append({"product_id": pid, "quantity": qty})

    product_ids = {p["product_id"] for p in parsed}
    products = Product.query.filter(Product.id.in_(product_ids)).all()
    if len(products) != len(product_ids):
        return jsonify({"error": "One or more products not found."}), 400

    prod_map = {p.id: p for p in products}

    order = Order(user_id=current_user.id, status="PENDING")

    for it in parsed:
        p = prod_map[it["product_id"]]
        if p.stock < it["quantity"]:
            return jsonify({"error": f"Not enough stock for product '{p.name}'."}), 400

        order.items.append(
            OrderItem(
                product_id=p.id,
                quantity=it["quantity"],
                price_at_purchase=p.price, 
            )
        )

    order.total_price = _calc_total(order)

    db.session.add(order)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Duplicate product in order items is not allowed."}), 409

    return jsonify({
        "message": "Order created.",
        "order": {
            "id": order.id,
            "user_id": order.user_id,
            "status": order.status,
            "total_price": str(order.total_price),
            "created_at": order.created_at.isoformat() if order.created_at else None,
            "items": [
                {
                    "id": oi.id,
                    "product_id": oi.product_id,
                    "product_name": oi.product.name,
                    "quantity": oi.quantity,
                    "price_at_purchase": str(oi.price_at_purchase),
                }
                for oi in order.items
            ]
        }
    }), 201


def list_orders():
    """
    Auth required.
    - User: vidi samo svoje.
    - Admin: vidi sve + filter userId/status.
    Sort: total_price, created_at
    """
    sort = (request.args.get("sort") or "created_at").strip().lower()
    direction = (request.args.get("dir") or "desc").strip().lower()

    if sort not in ALLOWED_SORT:
        sort = "created_at"
    if direction not in ALLOWED_DIR:
        direction = "desc"

    q = Order.query

    role = (current_user.role or "").lower()
    if role == "user":
        q = q.filter(Order.user_id == current_user.id)
    else:
        user_id = request.args.get("userId")
        status = (request.args.get("status") or "").strip().upper()

        if user_id:
            try:
                uid = int(user_id)
            except ValueError:
                return jsonify({"error": "userId must be an integer"}), 400
            q = q.filter(Order.user_id == uid)

        if status:
            if status not in ALLOWED_STATUS:
                return jsonify({"error": f"Invalid status. Allowed: {sorted(ALLOWED_STATUS)}"}), 400
            q = q.filter(Order.status == status)

    sort_col = getattr(Order, sort)
    q = q.order_by(asc(sort_col) if direction == "asc" else desc(sort_col))

    orders = q.all()

    return jsonify({
        "items": [
            {
                "id": o.id,
                "user_id": o.user_id,
                "status": o.status,
                "total_price": str(o.total_price),
                "created_at": o.created_at.isoformat() if o.created_at else None,
            }
            for o in orders
        ],
        "count": len(orders),
        "sort": sort,
        "dir": direction,
    }), 200


def get_order(order_id: int):
    """
    Auth required.
    - User: samo svoje
    - Admin: bilo koju
    """
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"error": "Order not found."}), 404

    role = (current_user.role or "").lower()
    if role == "user" and order.user_id != current_user.id:
        return jsonify({"error": "Forbidden"}), 403

    return jsonify({
        "order": {
            "id": order.id,
            "user_id": order.user_id,
            "status": order.status,
            "total_price": str(order.total_price),
            "created_at": order.created_at.isoformat() if order.created_at else None,
            "items": [
                {
                    "id": oi.id,
                    "product_id": oi.product_id,
                    "product_name": oi.product.name,
                    "quantity": oi.quantity,
                    "price_at_purchase": str(oi.price_at_purchase),
                }
                for oi in order.items
            ]
        }
    }), 200


def cancel_order(order_id: int):
    """
    User-only: može samo svoje i samo ako je PENDING
    """
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"error": "Order not found."}), 404

    if order.user_id != current_user.id:
        return jsonify({"error": "Forbidden"}), 403

    if (order.status or "").upper() != "PENDING":
        return jsonify({"error": "Only PENDING orders can be cancelled by user."}), 400

    order.status = "CANCELLED"
    db.session.commit()

    return jsonify({"message": "Order cancelled.", "status": order.status}), 200


def admin_update_status(order_id: int):
    """
    Admin-only: menja status na ostale (PROCESSING/PAID/COMPLETED/CANCELLED).
    """
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"error": "Order not found."}), 404

    data = request.get_json(silent=True) or {}
    status = (data.get("status") or "").strip().upper()

    if status not in ALLOWED_STATUS:
        return jsonify({"error": f"Invalid status. Allowed: {sorted(ALLOWED_STATUS)}"}), 400

    if is_final_status(order.status) and status != order.status:
        return jsonify({"error": "Cannot change status after it is final."}), 400

    order.status = status
    db.session.commit()

    return jsonify({"message": "Status updated.", "status": order.status}), 200
