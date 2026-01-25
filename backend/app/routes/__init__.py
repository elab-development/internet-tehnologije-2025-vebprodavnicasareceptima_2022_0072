from app.routes.auth_routes import auth_bp
from app.routes.product_routes import products_bp

def register_routes(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(products_bp)