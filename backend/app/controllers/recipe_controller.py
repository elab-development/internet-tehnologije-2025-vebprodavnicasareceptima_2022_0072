from flask import request, jsonify
from sqlalchemy.exc import IntegrityError
from sqlalchemy import asc, desc
from flask_login import current_user

from app.extensions import db
from app.models import Recipe, RecipeIngredient, Product

ALLOWED_SORT = {"name"}
ALLOWED_DIR = {"asc", "desc"}


def _validate_ingredient_obj(obj):
    product_id = obj.get("product_id")
    quantity = obj.get("quantity")
    unit = (obj.get("unit") or "").strip()

    try:
        product_id = int(product_id)
    except (TypeError, ValueError):
        return None, "product_id must be an integer"

    try:
        quantity = int(quantity)
    except (TypeError, ValueError):
        return None, "quantity must be an integer"

    if quantity <= 0:
        return None, "quantity must be > 0"

    if len(unit) > 50:
        return None, "unit must be at most 50 characters"

    return {"product_id": product_id, "quantity": quantity, "unit": unit}, None


def create_recipe():
    data = request.get_json(silent=True) or {}

    name = (data.get("name") or "").strip()
    description = data.get("description")
    ingredients = data.get("ingredients") or []

    if not name:
        return jsonify({"error": "Name is required."}), 400
    if len(name) > 100:
        return jsonify({"error": "Name must be at most 100 characters."}), 400
    if not isinstance(ingredients, list) or len(ingredients) == 0:
        return jsonify({"error": "Ingredients must be a non-empty array."}), 400

    parsed = []
    for ing in ingredients:
        if not isinstance(ing, dict):
            return jsonify({"error": "Each ingredient must be an object."}), 400
        v, err = _validate_ingredient_obj(ing)
        if err:
            return jsonify({"error": err}), 400
        parsed.append(v)

    product_ids = {p["product_id"] for p in parsed}
    products = Product.query.filter(Product.id.in_(product_ids)).all()
    if len(products) != len(product_ids):
        return jsonify({"error": "One or more products not found."}), 400

    recipe = Recipe(
        name=name,
        description=description,
        creator_id=current_user.id, 
    )

    for ing in parsed:
        recipe.ingredients.append(
            RecipeIngredient(
                product_id=ing["product_id"],
                quantity=ing["quantity"],
                unit=ing["unit"],
            )
        )

    db.session.add(recipe)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Recipe name must be unique OR duplicate product in ingredients."}), 409

    return jsonify({
        "message": "Recipe created.",
        "recipe": {
            "id": recipe.id,
            "name": recipe.name,
            "description": recipe.description,
            "creator_id": recipe.creator_id,
            "ingredients": [
                {
                    "id": ri.id,
                    "product_id": ri.product_id,
                    "product_name": ri.product.name,
                    "quantity": ri.quantity,
                    "unit": ri.unit,
                }
                for ri in recipe.ingredients
            ],
        }
    }), 201


def update_recipe(recipe_id: int):
    recipe = Recipe.query.get(recipe_id)
    if not recipe:
        return jsonify({"error": "Recipe not found."}), 404

    data = request.get_json(silent=True) or {}

    if "name" in data:
        name = (data.get("name") or "").strip()
        if not name:
            return jsonify({"error": "Name cannot be empty."}), 400
        if len(name) > 100:
            return jsonify({"error": "Name must be at most 100 characters."}), 400
        recipe.name = name

    if "description" in data:
        recipe.description = data.get("description")

    if "ingredients" in data:
        ingredients = data.get("ingredients") or []
        if not isinstance(ingredients, list) or len(ingredients) == 0:
            return jsonify({"error": "Ingredients must be a non-empty array."}), 400

        parsed = []
        for ing in ingredients:
            v, err = _validate_ingredient_obj(ing)
            if err:
                return jsonify({"error": err}), 400
            parsed.append(v)

        product_ids = {p["product_id"] for p in parsed}
        products = Product.query.filter(Product.id.in_(product_ids)).all()
        if len(products) != len(product_ids):
            return jsonify({"error": "One or more products not found."}), 400

        recipe.ingredients.clear()
        for ing in parsed:
            recipe.ingredients.append(
                RecipeIngredient(
                    product_id=ing["product_id"],
                    quantity=ing["quantity"],
                    unit=ing["unit"],
                )
            )

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Recipe name must be unique OR duplicate product in ingredients."}), 409

    return jsonify({
        "message": "Recipe updated.",
        "recipe": {
            "id": recipe.id,
            "name": recipe.name,
            "description": recipe.description,
        }
    }), 200


def delete_recipe(recipe_id: int):
    recipe = Recipe.query.get(recipe_id)
    if not recipe:
        return jsonify({"error": "Recipe not found."}), 404

    db.session.delete(recipe)
    db.session.commit()
    return jsonify({"message": "Recipe deleted."}), 200


def get_recipe(recipe_id: int):
    recipe = Recipe.query.get(recipe_id)
    if not recipe:
        return jsonify({"error": "Recipe not found."}), 404

    return jsonify({
        "recipe": {
            "id": recipe.id,
            "name": recipe.name,
            "description": recipe.description,
            "creator_id": recipe.creator_id,
            "ingredients": [
                {
                    "id": ri.id,
                    "product_id": ri.product_id,
                    "product_name": ri.product.name,
                    "quantity": ri.quantity,
                    "unit": ri.unit,
                }
                for ri in recipe.ingredients
            ],
        }
    }), 200


def list_recipes():
    search = (request.args.get("search") or "").strip()
    sort = (request.args.get("sort") or "name").strip().lower()
    direction = (request.args.get("dir") or "asc").strip().lower()
    product_id = request.args.get("productId")

    if sort not in ALLOWED_SORT:
        sort = "name"
    if direction not in ALLOWED_DIR:
        direction = "asc"

    q = Recipe.query

    if product_id:
        try:
            pid = int(product_id)
        except ValueError:
            return jsonify({"error": "productId must be an integer"}), 400
        q = q.join(RecipeIngredient).filter(RecipeIngredient.product_id == pid)

    if search:
        q = (
            q.outerjoin(RecipeIngredient)
             .outerjoin(Product, Product.id == RecipeIngredient.product_id)
             .filter(
                 db.or_(
                     Recipe.name.ilike(f"%{search}%"),
                     Recipe.description.ilike(f"%{search}%"),
                     Product.name.ilike(f"%{search}%"),
                 )
             )
        )

    q = q.distinct()

    sort_col = getattr(Recipe, sort)
    q = q.order_by(asc(sort_col) if direction == "asc" else desc(sort_col))

    items = q.all()

    return jsonify({
        "items": [
            {
                "id": r.id,
                "name": r.name,
                "description": r.description,
            }
            for r in items
        ],
        "count": len(items),
        "search": search,
        "sort": sort,
        "dir": direction,
        "productId": product_id,
    }), 200
