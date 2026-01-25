from decimal import Decimal, InvalidOperation
from flask import request, jsonify
from sqlalchemy.exc import IntegrityError
from sqlalchemy import asc, desc

from app.extensions import db
from app.models import Product

ALLOWED_SORT_FIELDS = {"name", "price", "stock", "created_at"}
ALLOWED_SORT_DIR = {"asc", "desc"}


def _parse_price(value):
    try:
        d = Decimal(str(value))
    except (InvalidOperation, TypeError):
        return None
    return d


def create_product():
    data = request.get_json(silent=True) or {}

    name = (data.get("name") or "").strip()
    price_raw = data.get("price")
    stock_raw = data.get("stock", 0)

    if not name:
        return jsonify({"error": "Name is required."}), 400

    price = _parse_price(price_raw)
    if price is None or price <= 0:
        return jsonify({"error": "Price must be a number > 0."}), 400

    try:
        stock = int(stock_raw)
    except (TypeError, ValueError):
        return jsonify({"error": "Stock must be an integer >= 0."}), 400

    if stock < 0:
        return jsonify({"error": "Stock must be >= 0."}), 400

    product = Product(name=name, price=price, stock=stock)

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
            "price": str(product.price),
            "stock": product.stock,
        }
    }), 201


def update_product(product_id: int):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found."}), 404

    data = request.get_json(silent=True) or {}

    if "name" in data:
        name = (data.get("name") or "").strip()
        if not name:
            return jsonify({"error": "Name cannot be empty."}), 400
        product.name = name

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
            "price": str(product.price),
            "stock": product.stock,
        }
    }), 200


def delete_product(product_id: int):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found."}), 404

    db.session.delete(product)
    db.session.commit()

    return jsonify({"message": "Product deleted."}), 200


def list_products():
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
    p = Product.query.get(product_id)
    if not p:
        return jsonify({"error": "Product not found."}), 404

    return jsonify({
        "product": {
            "id": p.id,
            "name": p.name,
            "price": str(p.price),
            "stock": p.stock,
        }
    }), 200
