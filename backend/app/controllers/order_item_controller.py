from flask import request, jsonify
from sqlalchemy.exc import IntegrityError
from flask_login import current_user

from app.extensions import db
from app.models import Order, OrderItem, Product
from app.middlewares.order_rules import is_final_status


def list_order_items():
    """
    List order items (requires orderId)
    ---
    tags:
      - OrderItems
    security:
      - cookieAuth: []
    parameters:
      - in: query
        name: orderId
        required: true
        type: integer
    responses:
      200:
        description: Items list
        schema:
          type: object
          properties:
            items:
              type: array
              items:
                $ref: '#/definitions/OrderItem'
            count: { type: integer }
            orderId: { type: integer }
      400:
        description: Missing/invalid orderId
        schema:
          $ref: '#/definitions/Error'
      401:
        description: Not authenticated
        schema:
          $ref: '#/definitions/Error'
      403:
        description: Forbidden
        schema:
          $ref: '#/definitions/Error'
      404:
        description: Order not found
        schema:
          $ref: '#/definitions/Error'
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
    Update order item quantity (auth, only non-final orders)
    ---
    tags:
      - OrderItems
    security:
      - cookieAuth: []
    parameters:
      - in: path
        name: item_id
        required: true
        type: integer
      - in: body
        name: body
        required: true
        schema:
          type: object
          required: [quantity]
          properties:
            quantity: { type: integer, example: 3 }
    responses:
      200:
        description: Updated
        schema:
          type: object
          properties:
            message: { type: string }
      400:
        description: Validation / final order / stock
        schema:
          $ref: '#/definitions/Error'
      401:
        description: Not authenticated
        schema:
          $ref: '#/definitions/Error'
      403:
        description: Forbidden
        schema:
          $ref: '#/definitions/Error'
      404:
        description: Item/order not found
        schema:
          $ref: '#/definitions/Error'
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
