from flask import request, jsonify
from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.models import RecipeIngredient, Product, Recipe


def list_recipe_ingredients():
    recipe_id = request.args.get("recipeId")
    q = RecipeIngredient.query

    if recipe_id:
        try:
            rid = int(recipe_id)
        except ValueError:
            return jsonify({"error": "recipeId must be an integer"}), 400
        q = q.filter(RecipeIngredient.recipe_id == rid)

    items = q.all()

    return jsonify({
        "items": [
            {
                "id": ri.id,
                "recipe_id": ri.recipe_id,
                "product_id": ri.product_id,
                "product_name": ri.product.name,
                "quantity": ri.quantity,
                "unit": ri.unit,
            }
            for ri in items
        ],
        "count": len(items),
        "recipeId": recipe_id,
    }), 200


def get_recipe_ingredient(ri_id: int):
    ri = RecipeIngredient.query.get(ri_id)
    if not ri:
        return jsonify({"error": "RecipeIngredient not found."}), 404

    return jsonify({
        "item": {
            "id": ri.id,
            "recipe_id": ri.recipe_id,
            "product_id": ri.product_id,
            "product_name": ri.product.name,
            "quantity": ri.quantity,
            "unit": ri.unit,
        }
    }), 200


def update_recipe_ingredient(ri_id: int):
    ri = RecipeIngredient.query.get(ri_id)
    if not ri:
        return jsonify({"error": "RecipeIngredient not found."}), 404

    data = request.get_json(silent=True) or {}

    if "product_id" in data:
        try:
            pid = int(data.get("product_id"))
        except (TypeError, ValueError):
            return jsonify({"error": "product_id must be an integer"}), 400
        if not Product.query.get(pid):
            return jsonify({"error": "Product not found."}), 400
        ri.product_id = pid

    if "quantity" in data:
        try:
            qty = int(data.get("quantity"))
        except (TypeError, ValueError):
            return jsonify({"error": "quantity must be an integer"}), 400
        if qty <= 0:
            return jsonify({"error": "quantity must be > 0"}), 400
        ri.quantity = qty

    if "unit" in data:
        unit = (data.get("unit") or "").strip()
        if len(unit) > 50:
            return jsonify({"error": "unit must be at most 50 characters"}), 400
        ri.unit = unit

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Duplicate product in same recipe is not allowed."}), 409

    return jsonify({"message": "RecipeIngredient updated."}), 200


def delete_recipe_ingredient(ri_id: int):
    ri = RecipeIngredient.query.get(ri_id)
    if not ri:
        return jsonify({"error": "RecipeIngredient not found."}), 404

    db.session.delete(ri)
    db.session.commit()
    return jsonify({"message": "RecipeIngredient deleted."}), 200
