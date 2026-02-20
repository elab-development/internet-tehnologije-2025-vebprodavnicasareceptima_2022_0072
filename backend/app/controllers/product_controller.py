from decimal import Decimal, InvalidOperation
from flask import request, jsonify
from sqlalchemy.exc import IntegrityError
from sqlalchemy import asc, desc

from app.extensions import db
from app.models import Product

ALLOWED_SORT_FIELDS = {"name", "unit", "price", "stock", "created_at"}
ALLOWED_SORT_DIR = {"asc", "desc"}


def _parse_price(value):
    try:
        d = Decimal(str(value))
    except (InvalidOperation, TypeError):
        return None
    return d


def create_product():
    """
    Create product (admin)
    ---
    tags:
      - Products
    security:
      - cookieAuth: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required: [name, price]
          properties:
            name: { type: string, example: "Milk" }
            unit: { type: string, example: "L" }
            price: { type: number, example: 2.00 }
            stock: { type: integer, example: 10 }
    responses:
      201:
        description: Created
        schema:
          type: object
          properties:
            message: { type: string }
            product:
              $ref: '#/definitions/Product'
      400:
        description: Validation error
        schema:
          $ref: '#/definitions/Error'
      401:
        description: Not authenticated
        schema:
          $ref: '#/definitions/Error'
      403:
        description: Forbidden (not admin)
        schema:
          $ref: '#/definitions/Error'
      409:
        description: Unique constraint
        schema:
          $ref: '#/definitions/Error'
    """
    data = request.get_json(silent=True) or {}

    name = (data.get("name") or "").strip()
    unit = (data.get("unit") or "").strip()
    price_raw = data.get("price")
    stock_raw = data.get("stock", 0)

    if not name:
        return jsonify({"error": "Name is required."}), 400

    if len(unit) > 50:
        return jsonify({"error": "Unit must be at most 50 characters."}), 400

    price = _parse_price(price_raw)
    if price is None or price <= 0:
        return jsonify({"error": "Price must be a number > 0."}), 400

    try:
        stock = int(stock_raw)
    except (TypeError, ValueError):
        return jsonify({"error": "Stock must be an integer >= 0."}), 400

    if stock < 0:
        return jsonify({"error": "Stock must be >= 0."}), 400

    product = Product(name=name, unit=unit, price=price, stock=stock)

    db.session.add(product)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Product name must be unique."}), 409

    return jsonify({
        "message": "Product created.",
        "product": {
            "id": product.id,
            "name": product.name,
            "unit": product.unit,
            "price": str(product.price),
            "stock": product.stock,
        }
    }), 201


def update_product(product_id: int):
    """
    Update product (admin)
    ---
    tags:
      - Products
    security:
      - cookieAuth: []
    parameters:
      - in: path
        name: product_id
        required: true
        type: integer
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            name: { type: string }
            unit: { type: string }
            price: { type: number }
            stock: { type: integer }
    responses:
      200:
        description: Updated
        schema:
          type: object
          properties:
            message: { type: string }
            product:
              $ref: '#/definitions/Product'
      400:
        description: Validation error
        schema:
          $ref: '#/definitions/Error'
      401:
        description: Not authenticated
        schema:
          $ref: '#/definitions/Error'
      403:
        description: Forbidden (not admin)
        schema:
          $ref: '#/definitions/Error'
      404:
        description: Not found
        schema:
          $ref: '#/definitions/Error'
      409:
        description: Unique constraint
        schema:
          $ref: '#/definitions/Error'
    """
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found."}), 404

    data = request.get_json(silent=True) or {}

    if "name" in data:
        name = (data.get("name") or "").strip()
        if not name:
            return jsonify({"error": "Name cannot be empty."}), 400
        product.name = name

    if "unit" in data:
        unit = (data.get("unit") or "").strip()
        if len(unit) > 50:
            return jsonify({"error": "Unit must be at most 50 characters."}), 400
        product.unit = unit

    if "price" in data:
        price = _parse_price(data.get("price"))
        if price is None or price <= 0:
            return jsonify({"error": "Price must be a number > 0."}), 400
        product.price = price

    if "stock" in data:
        try:
            stock = int(data.get("stock"))
        except (TypeError, ValueError):
            return jsonify({"error": "Stock must be an integer >= 0."}), 400
        if stock < 0:
            return jsonify({"error": "Stock must be >= 0."}), 400
        product.stock = stock

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Product name must be unique."}), 409

    return jsonify({
        "message": "Product updated.",
        "product": {
            "id": product.id,
            "name": product.name,
            "unit": product.unit,
            "price": str(product.price),
            "stock": product.stock,
        }
    }), 200


def delete_product(product_id: int):
    """
    Delete product (admin)
    ---
    tags:
      - Products
    security:
      - cookieAuth: []
    parameters:
      - in: path
        name: product_id
        required: true
        type: integer
    responses:
      200:
        description: Deleted
        schema:
          type: object
          properties:
            message: { type: string }
      401:
        description: Not authenticated
        schema:
          $ref: '#/definitions/Error'
      403:
        description: Forbidden (not admin)
        schema:
          $ref: '#/definitions/Error'
      404:
        description: Not found
        schema:
          $ref: '#/definitions/Error'
    """
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found."}), 404

    db.session.delete(product)
    db.session.commit()

    return jsonify({"message": "Product deleted."}), 200


def list_products():
    """
    List products
    ---
    tags:
      - Products
    parameters:
      - in: query
        name: search
        type: string
        required: false
      - in: query
        name: sort
        type: string
        required: false
        enum: ["name", "unit", "price", "stock", "created_at"]
        default: "created_at"
      - in: query
        name: dir
        type: string
        required: false
        enum: ["asc", "desc"]
        default: "desc"
    responses:
      200:
        description: Products list
        schema:
          $ref: '#/definitions/ProductsListResponse'
    """
    search = (request.args.get("search") or "").strip()
    sort = (request.args.get("sort") or "created_at").strip().lower()
    direction = (request.args.get("dir") or "desc").strip().lower()

    if sort not in ALLOWED_SORT_FIELDS:
        sort = "created_at"
    if direction not in ALLOWED_SORT_DIR:
        direction = "desc"

    q = Product.query

    if search:
        q = q.filter(Product.name.ilike(f"%{search}%"))

    sort_col = getattr(Product, sort)
    q = q.order_by(asc(sort_col) if direction == "asc" else desc(sort_col))

    products = q.all()

    return jsonify({
        "items": [
            {
                "id": p.id,
                "name": p.name,
                "unit": p.unit,
                "price": str(p.price),
                "stock": p.stock,
            }
            for p in products
        ],
        "count": len(products),
        "search": search,
        "sort": sort,
        "dir": direction,
    }), 200


def get_product(product_id: int):
    """
    Get product by id
    ---
    tags:
      - Products
    parameters:
      - in: path
        name: product_id
        required: true
        type: integer
    responses:
      200:
        description: Product
        schema:
          type: object
          properties:
            product:
              $ref: '#/definitions/Product'
      404:
        description: Not found
        schema:
          $ref: '#/definitions/Error'
    """
    p = Product.query.get(product_id)
    if not p:
        return jsonify({"error": "Product not found."}), 404

    return jsonify({
        "product": {
            "id": p.id,
            "name": p.name,
            "unit": p.unit,
            "price": str(p.price),
            "stock": p.stock,
        }
    }), 200
