from functools import wraps
from flask import jsonify
from flask_login import current_user

def require_auth(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not current_user.is_authenticated:
            return jsonify({"error": "Unauthorized"}), 401
        return fn(*args, **kwargs)
    return wrapper


def require_role(*roles):
    roles_set = {r.lower() for r in roles}

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            if not current_user.is_authenticated:
                return jsonify({"error": "Unauthorized"}), 401
            if (current_user.role or "").lower() not in roles_set:
                return jsonify({"error": "Forbidden"}), 403
            return fn(*args, **kwargs)
        return wrapper

    return decorator

def require_user(fn):
    return require_role("user")(fn)

def require_admin(fn):
    return require_role("admin")(fn)
