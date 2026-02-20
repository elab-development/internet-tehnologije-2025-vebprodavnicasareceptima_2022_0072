def swagger_template():
    return {
        "swagger": "2.0",
        "info": {
            "title": "ShopTheStep API",
            "description": "Swagger dokumentacija za Flask API (auth, products, recipes, ingredients, orders, admin overview, external recipes).",
            "version": "1.0.0",
        },
        "basePath": "/",
        "schemes": ["http"],
        "consumes": ["application/json"],
        "produces": ["application/json"],

        "securityDefinitions": {
            "cookieAuth": {
                "type": "apiKey",
                "in": "cookie",
                "name": "session",
            }
        },

        "definitions": {
            "Error": {
                "type": "object",
                "properties": {"error": {"type": "string"}},
            },

            "UserPublic": {
                "type": "object",
                "properties": {
                    "id": {"type": "integer"},
                    "name": {"type": "string"},
                    "email": {"type": "string"},
                    "role": {"type": "string", "enum": ["user", "admin"]},
                },
            },
            "AuthResponse": {
                "type": "object",
                "properties": {
                    "message": {"type": "string"},
                    "user": {"$ref": "#/definitions/UserPublic"},
                },
            },
            "MeResponse": {
                "type": "object",
                "properties": {
                    "user": {
                        "type": ["object", "null"],
                        "allOf": [{"$ref": "#/definitions/UserPublic"}],
                    }
                },
            },

            "Product": {
                "type": "object",
                "properties": {
                    "id": {"type": "integer"},
                    "name": {"type": "string"},
                    "unit": {"type": "string"},
                    "price": {"type": "string", "example": "12.50"},
                    "stock": {"type": "integer"},
                },
            },
            "ProductsListResponse": {
                "type": "object",
                "properties": {
                    "items": {"type": "array", "items": {"$ref": "#/definitions/Product"}},
                    "count": {"type": "integer"},
                    "search": {"type": "string"},
                    "sort": {"type": "string"},
                    "dir": {"type": "string"},
                },
            },

            "RecipeListItem": {
                "type": "object",
                "properties": {
                    "id": {"type": "integer"},
                    "name": {"type": "string"},
                    "description": {"type": ["string", "null"]},
                },
            },
            "RecipeIngredient": {
                "type": "object",
                "properties": {
                    "id": {"type": "integer"},
                    "recipe_id": {"type": "integer"},
                    "product_id": {"type": "integer"},
                    "product_name": {"type": "string"},
                    "quantity": {"type": "integer"},
                    "unit": {"type": "string"},
                },
            },
            "RecipeDetails": {
                "type": "object",
                "properties": {
                    "id": {"type": "integer"},
                    "name": {"type": "string"},
                    "description": {"type": ["string", "null"]},
                    "creator_id": {"type": "integer"},
                    "ingredients": {"type": "array", "items": {"$ref": "#/definitions/RecipeIngredient"}},
                },
            },
            "RecipesListResponse": {
                "type": "object",
                "properties": {
                    "items": {"type": "array", "items": {"$ref": "#/definitions/RecipeListItem"}},
                    "count": {"type": "integer"},
                    "search": {"type": "string"},
                    "sort": {"type": "string"},
                    "dir": {"type": "string"},
                    "productId": {"type": ["string", "null"]},
                },
            },

            "OrderItem": {
                "type": "object",
                "properties": {
                    "id": {"type": "integer"},
                    "order_id": {"type": "integer"},
                    "product_id": {"type": "integer"},
                    "product_name": {"type": "string"},
                    "quantity": {"type": "integer"},
                    "price_at_purchase": {"type": "string", "example": "2.00"},
                },
            },
            "Order": {
                "type": "object",
                "properties": {
                    "id": {"type": "integer"},
                    "user_id": {"type": "integer"},
                    "status": {"type": "string", "enum": ["PENDING", "PROCESSING", "PAID", "COMPLETED", "CANCELLED"]},
                    "total_price": {"type": "string", "example": "15.50"},
                    "created_at": {"type": ["string", "null"], "format": "date-time"},
                },
            },
            "OrderDetails": {
                "type": "object",
                "properties": {
                    "id": {"type": "integer"},
                    "user_id": {"type": "integer"},
                    "status": {"type": "string"},
                    "total_price": {"type": "string"},
                    "created_at": {"type": ["string", "null"], "format": "date-time"},
                    "items": {"type": "array", "items": {"$ref": "#/definitions/OrderItem"}},
                },
            },
            "OrdersListResponse": {
                "type": "object",
                "properties": {
                    "items": {"type": "array", "items": {"$ref": "#/definitions/Order"}},
                    "count": {"type": "integer"},
                    "sort": {"type": "string"},
                    "dir": {"type": "string"},
                },
            },

            "AdminOverviewResponse": {
                "type": "object",
                "properties": {
                    "range": {
                        "type": "object",
                        "properties": {
                            "days": {"type": "integer"},
                            "since": {"type": "string", "example": "2026-01-22"},
                        },
                    },
                    "kpis": {
                        "type": "object",
                        "properties": {
                            "users": {"type": "integer"},
                            "products": {"type": "integer"},
                            "recipes": {"type": "integer"},
                            "orders": {"type": "integer"},
                            "low_stock_count": {"type": "integer"},
                            "total_revenue": {"type": "string", "example": "120.50"},
                        },
                    },
                    "charts": {
                        "type": "object",
                        "properties": {
                            "orders_by_status": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "status": {"type": "string"},
                                        "count": {"type": "integer"},
                                    },
                                },
                            },
                            "revenue_by_day": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "day": {"type": "string", "example": "2026-02-01"},
                                        "revenue": {"type": "string", "example": "25.00"},
                                    },
                                },
                            },
                            "orders_by_day": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "day": {"type": "string", "example": "2026-02-01"},
                                        "count": {"type": "integer"},
                                    },
                                },
                            },
                            "top_products_by_revenue": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "product_id": {"type": "integer"},
                                        "name": {"type": "string"},
                                        "revenue": {"type": "string", "example": "50.00"},
                                    },
                                },
                            },
                            "top_products_by_quantity": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "product_id": {"type": "integer"},
                                        "name": {"type": "string"},
                                        "quantity": {"type": "integer"},
                                    },
                                },
                            },
                        },
                    },
                    "tables": {
                        "type": "object",
                        "properties": {
                            "low_stock_items": {
                                "type": "array",
                                "items": {"$ref": "#/definitions/Product"},
                            }
                        },
                    },
                },
            },

            "ExternalIngredient": {
                "type": "object",
                "properties": {"name": {"type": "string"}, "measure": {"type": "string"}},
            },
            "ExternalRecipe": {
                "type": "object",
                "properties": {
                    "source": {"type": "string", "example": "themealdb"},
                    "external_id": {"type": "string"},
                    "title": {"type": "string"},
                    "image": {"type": "string"},
                    "category": {"type": "string"},
                    "area": {"type": "string"},
                    "instructions": {"type": "string"},
                    "youtube": {"type": "string"},
                    "tags": {"type": "string"},
                    "ingredients": {"type": "array", "items": {"$ref": "#/definitions/ExternalIngredient"}},
                },
            },
            "ExternalRecipesListResponse": {
                "type": "object",
                "properties": {
                    "q": {"type": "string"},
                    "items": {"type": "array", "items": {"$ref": "#/definitions/ExternalRecipe"}},
                    "count": {"type": "integer"},
                },
            },
            "ExternalRecipeDetailsResponse": {
                "type": "object",
                "properties": {"recipe": {"$ref": "#/definitions/ExternalRecipe"}},
            },
        },

        "tags": [
            {"name": "Auth", "description": "Register / login / logout / me"},
            {"name": "Products", "description": "Products CRUD"},
            {"name": "Recipes", "description": "Recipes CRUD"},
            {"name": "RecipeIngredients", "description": "Recipe ingredients endpoints"},
            {"name": "Orders", "description": "Orders endpoints"},
            {"name": "OrderItems", "description": "Order items endpoints"},
            {"name": "Admin", "description": "Admin dashboard endpoints"},
            {"name": "ExternalRecipes", "description": "TheMealDB proxy endpoints"},
            {"name": "Health", "description": "Health endpoints"},
        ],
    }