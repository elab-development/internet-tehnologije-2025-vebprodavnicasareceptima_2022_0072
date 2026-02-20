from flask import request, jsonify
from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.models import RecipeIngredient, Product, Recipe


def list_recipe_ingredients():
    """
    List recipe ingredients (optional filter by recipeId)
    ---
    tags:
      - RecipeIngredients
    parameters:
      - in: query
        name: recipeId
        type: integer
        required: false
    responses:
      200:
        description: Ingredients list
        schema:
          type: object
          properties:
            items:
              type: array
              items:
                $ref: '#/definitions/RecipeIngredient'
            count: { type: integer }
            recipeId: { type: string }
      400:
        description: Invalid recipeId
        schema:
          $ref: '#/definitions/Error'
    """
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
    """
    Get recipe ingredient by id
    ---
    tags:
      - RecipeIngredients
    parameters:
      - in: path
        name: ri_id
        required: true
        type: integer
    responses:
      200:
        description: Ingredient item
        schema:
          type: object
          properties:
            item:
              $ref: '#/definitions/RecipeIngredient'
      404:
        description: Not found
        schema:
          $ref: '#/definitions/Error'
    """
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
    """
    Update recipe ingredient (admin)
    ---
    tags:
      - RecipeIngredients
    security:
      - cookieAuth: []
    parameters:
      - in: path
        name: ri_id
        required: true
        type: integer
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            product_id: { type: integer }
            quantity: { type: integer }
            unit: { type: string }
    responses:
      200:
        description: Updated
        schema:
          type: object
          properties:
            message: { type: string }
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
        description: Duplicate product in same recipe
        schema:
          $ref: '#/definitions/Error'
    """
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
    """
    Delete recipe ingredient (admin)
    ---
    tags:
      - RecipeIngredients
    security:
      - cookieAuth: []
    parameters:
      - in: path
        name: ri_id
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
    ri = RecipeIngredient.query.get(ri_id)
    if not ri:
        return jsonify({"error": "RecipeIngredient not found."}), 404

    db.session.delete(ri)
    db.session.commit()
    return jsonify({"message": "RecipeIngredient deleted."}), 200
