from app.routes.auth_routes import auth_bp
from app.routes.product_routes import products_bp
from app.routes.recipe_routes import recipes_bp
from app.routes.recipe_ingredient_routes import recipe_ingredients_bp

def register_routes(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(products_bp)
    app.register_blueprint(recipes_bp)
    app.register_blueprint(recipe_ingredients_bp)