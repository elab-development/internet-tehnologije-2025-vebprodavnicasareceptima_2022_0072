from datetime import datetime, timedelta
from decimal import Decimal

from flask import request, jsonify
from sqlalchemy import func, case, desc

from app.extensions import db
from app.models import User, Product, Recipe, Order, OrderItem


FINAL_REVENUE_STATUSES = {"PAID", "COMPLETED"}  


def _to_int(v, default):
    try:
        return int(v)
    except (TypeError, ValueError):
        return default


def _money(v):
    # Decimal/None -> string "0.00"
    if v is None:
        return "0.00"
    try:
        return str(Decimal(v).quantize(Decimal("0.01")))
    except Exception:
        return str(v)


def admin_overview():
    """
    Admin overview (KPIs + charts)
    ---
    tags:
      - Admin
    security:
      - cookieAuth: []
    parameters:
      - in: query
        name: days
        type: integer
        required: false
        default: 30
        description: Range in days (min 7, max 365)
      - in: query
        name: lowStock
        type: integer
        required: false
        default: 5
        description: Low stock threshold (>=0)
    responses:
      200:
        description: Overview payload for admin dashboard
        schema:
          $ref: '#/definitions/AdminOverviewResponse'
      401:
        description: Not authenticated
        schema:
          $ref: '#/definitions/Error'
      403:
        description: Forbidden (not admin)
        schema:
          $ref: '#/definitions/Error'
    """
    days = _to_int(request.args.get("days"), 30)
    days = max(7, min(days, 365)) 

    low_stock_threshold = _to_int(request.args.get("lowStock"), 5)
    low_stock_threshold = max(0, min(low_stock_threshold, 10_000))

    since_dt = datetime.utcnow() - timedelta(days=days)

    # --- KPIs ---
    users_count = db.session.query(func.count(User.id)).scalar() or 0
    products_count = db.session.query(func.count(Product.id)).scalar() or 0
    recipes_count = db.session.query(func.count(Recipe.id)).scalar() or 0
    orders_count = db.session.query(func.count(Order.id)).scalar() or 0

    low_stock_count = (
        db.session.query(func.count(Product.id))
        .filter(Product.stock <= low_stock_threshold)
        .scalar()
        or 0
    )

    total_revenue = (
        db.session.query(func.coalesce(func.sum(Order.total_price), 0))
        .filter(Order.status.in_(list(FINAL_REVENUE_STATUSES)))
        .scalar()
    )

    # --- Orders by status (pie/donut) ---
    rows_status = (
        db.session.query(
            Order.status,
            func.count(Order.id).label("count"),
        )
        .group_by(Order.status)
        .all()
    )
    orders_by_status = [{"status": s, "count": int(c)} for (s, c) in rows_status]

    # --- Revenue by day (line) poslednjih N dana ---
    # Postgres: date_trunc('day', created_at)
    revenue_by_day_rows = (
        db.session.query(
            func.date_trunc("day", Order.created_at).label("day"),
            func.coalesce(func.sum(Order.total_price), 0).label("revenue"),
        )
        .filter(Order.created_at >= since_dt)
        .filter(Order.status.in_(list(FINAL_REVENUE_STATUSES)))
        .group_by(func.date_trunc("day", Order.created_at))
        .order_by(func.date_trunc("day", Order.created_at).asc())
        .all()
    )
    revenue_by_day = [
        {"day": d.date().isoformat(), "revenue": _money(r)}
        for (d, r) in revenue_by_day_rows
    ]

    # --- Orders by day (bar/line) poslednjih N dana ---
    orders_by_day_rows = (
        db.session.query(
            func.date_trunc("day", Order.created_at).label("day"),
            func.count(Order.id).label("count"),
        )
        .filter(Order.created_at >= since_dt)
        .group_by(func.date_trunc("day", Order.created_at))
        .order_by(func.date_trunc("day", Order.created_at).asc())
        .all()
    )
    orders_by_day = [{"day": d.date().isoformat(), "count": int(c)} for (d, c) in orders_by_day_rows]

    # --- Top products by revenue (bar) ---
    # revenue = sum(price_at_purchase * quantity) kroz order_items, ali samo za paid/completed orders
    top_products_by_revenue_rows = (
        db.session.query(
            Product.id,
            Product.name,
            func.coalesce(func.sum(OrderItem.price_at_purchase * OrderItem.quantity), 0).label("revenue"),
        )
        .join(OrderItem, OrderItem.product_id == Product.id)
        .join(Order, Order.id == OrderItem.order_id)
        .filter(Order.status.in_(list(FINAL_REVENUE_STATUSES)))
        .group_by(Product.id, Product.name)
        .order_by(desc("revenue"))
        .limit(10)
        .all()
    )
    top_products_by_revenue = [
        {"product_id": pid, "name": name, "revenue": _money(rev)}
        for (pid, name, rev) in top_products_by_revenue_rows
    ]

    # --- Top products by quantity (bar) ---
    top_products_by_qty_rows = (
        db.session.query(
            Product.id,
            Product.name,
            func.coalesce(func.sum(OrderItem.quantity), 0).label("qty"),
        )
        .join(OrderItem, OrderItem.product_id == Product.id)
        .join(Order, Order.id == OrderItem.order_id)
        .filter(Order.status.in_(list(FINAL_REVENUE_STATUSES)))
        .group_by(Product.id, Product.name)
        .order_by(desc("qty"))
        .limit(10)
        .all()
    )
    top_products_by_quantity = [
        {"product_id": pid, "name": name, "quantity": int(qty)}
        for (pid, name, qty) in top_products_by_qty_rows
    ]

    # --- Low stock list (table) ---
    low_stock_items_rows = (
        db.session.query(Product.id, Product.name, Product.stock, Product.unit, Product.price)
        .filter(Product.stock <= low_stock_threshold)
        .order_by(Product.stock.asc(), Product.name.asc())
        .limit(20)
        .all()
    )
    low_stock_items = [
        {
            "id": pid,
            "name": name,
            "stock": int(stock),
            "unit": unit,
            "price": _money(price),
        }
        for (pid, name, stock, unit, price) in low_stock_items_rows
    ]

    return jsonify({
        "range": {"days": days, "since": since_dt.date().isoformat()},
        "kpis": {
            "users": users_count,
            "products": products_count,
            "recipes": recipes_count,
            "orders": orders_count,
            "low_stock_count": low_stock_count,
            "total_revenue": _money(total_revenue),
        },
        "charts": {
            "orders_by_status": orders_by_status,
            "revenue_by_day": revenue_by_day,
            "orders_by_day": orders_by_day,
            "top_products_by_revenue": top_products_by_revenue,
            "top_products_by_quantity": top_products_by_quantity,
        },
        "tables": {
            "low_stock_items": low_stock_items,
        }
    }), 200