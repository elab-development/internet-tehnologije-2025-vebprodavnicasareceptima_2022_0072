from flask import Blueprint
from app.controllers.external_recipe_controller import (
    search_external_recipes,
    get_external_recipe_details,
)

external_recipes_bp = Blueprint(
    "external_recipes",
    __name__,
    url_prefix="/api/external/recipes"
)

external_recipes_bp.get("")(search_external_recipes)            
external_recipes_bp.get("/<string:source>/<string:external_id>")(get_external_recipe_details)
