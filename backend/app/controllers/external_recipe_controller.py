import os
import requests
from flask import request, jsonify


def _get_themealdb_key() -> str:
    return os.getenv("THEMEALDB_API_KEY", "1").strip() or "1"


def _themealdb_search_url(q: str) -> str:
    key = _get_themealdb_key()
    return f"https://www.themealdb.com/api/json/v1/{key}/search.php?s={q}"


def _themealdb_lookup_url(external_id: str) -> str:
    key = _get_themealdb_key()
    return f"https://www.themealdb.com/api/json/v1/{key}/lookup.php?i={external_id}"


def _normalize_themealdb_meal(meal: dict) -> dict:
    ingredients = []
    for i in range(1, 21):
        ing = (meal.get(f"strIngredient{i}") or "").strip()
        meas = (meal.get(f"strMeasure{i}") or "").strip()
        if ing:
            ingredients.append({
                "name": ing,
                "measure": meas,
            })

    return {
        "source": "themealdb",
        "external_id": str(meal.get("idMeal") or ""),
        "title": meal.get("strMeal"),
        "image": meal.get("strMealThumb"),
        "category": meal.get("strCategory"),
        "area": meal.get("strArea"),
        "instructions": meal.get("strInstructions"),
        "youtube": meal.get("strYoutube"),
        "tags": (meal.get("strTags") or ""),
        "ingredients": ingredients,
    }


def search_external_recipes():
    """
    Search external recipes (TheMealDB)
    ---
    tags:
      - ExternalRecipes
    parameters:
      - in: query
        name: q
        required: true
        type: string
        example: "pasta"
    responses:
      200:
        description: External recipes list
        schema:
          $ref: '#/definitions/ExternalRecipesListResponse'
      400:
        description: Missing query param
        schema:
          $ref: '#/definitions/Error'
      502:
        description: External API not reachable / error
        schema:
          $ref: '#/definitions/Error'
    """
    q = (request.args.get("q") or "").strip()
    if not q:
        return jsonify({"error": "Query param 'q' is required."}), 400

    try:
        res = requests.get(_themealdb_search_url(q), timeout=10)
    except requests.RequestException:
        return jsonify({"error": "External recipe API not reachable."}), 502

    if res.status_code != 200:
        return jsonify({"error": f"External recipe API error: {res.status_code}"}), 502

    data = res.json() or {}
    meals = data.get("meals") or []

    items = [_normalize_themealdb_meal(m) for m in meals]

    return jsonify({
        "q": q,
        "items": items,
        "count": len(items),
    }), 200


def get_external_recipe_details(source: str, external_id: str):
    """
    External recipe details (TheMealDB)
    ---
    tags:
      - ExternalRecipes
    parameters:
      - in: path
        name: source
        required: true
        type: string
        enum: ["themealdb"]
      - in: path
        name: external_id
        required: true
        type: string
    responses:
      200:
        description: External recipe details
        schema:
          $ref: '#/definitions/ExternalRecipeDetailsResponse'
      400:
        description: Unsupported source / invalid input
        schema:
          $ref: '#/definitions/Error'
      404:
        description: Not found in external source
        schema:
          $ref: '#/definitions/Error'
      502:
        description: External API not reachable / error
        schema:
          $ref: '#/definitions/Error'
    """
    source = (source or "").strip().lower()
    if source != "themealdb":
        return jsonify({"error": "Unsupported source."}), 400

    if not external_id:
        return jsonify({"error": "external_id is required."}), 400

    try:
        res = requests.get(_themealdb_lookup_url(external_id), timeout=10)
    except requests.RequestException:
        return jsonify({"error": "External recipe API not reachable."}), 502

    if res.status_code != 200:
        return jsonify({"error": f"External recipe API error: {res.status_code}"}), 502

    data = res.json() or {}
    meals = data.get("meals") or []
    if not meals:
        return jsonify({"error": "Recipe not found in external source."}), 404

    recipe = _normalize_themealdb_meal(meals[0])

    return jsonify({"recipe": recipe}), 200