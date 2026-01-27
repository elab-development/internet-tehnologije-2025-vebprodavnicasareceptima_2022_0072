from flask import Blueprint
from app.controllers.recipe_ingredient_controller import (
    list_recipe_ingredients,
    get_recipe_ingredient,
    update_recipe_ingredient,
    delete_recipe_ingredient,
)
from app.middlewares.auth import require_role

recipe_ingredients_bp = Blueprint("recipe_ingredients", __name__, url_prefix="/api/recipe-ingredients")

recipe_ingredients_bp.get("")(list_recipe_ingredients)
recipe_ingredients_bp.get("/<int:ri_id>")(get_recipe_ingredient)

recipe_ingredients_bp.put("/<int:ri_id>")(require_role("admin")(update_recipe_ingredient))
recipe_ingredients_bp.delete("/<int:ri_id>")(require_role("admin")(delete_recipe_ingredient))
