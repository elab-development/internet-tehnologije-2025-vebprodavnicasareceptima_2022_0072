import os
from dotenv import load_dotenv

from app import create_app

load_dotenv()

app = create_app()

host = "0.0.0.0" if os.getenv("LOCAL_OR_DOCKER", "local") == "docker" else "127.0.0.1"

if __name__ == "__main__":
    app.run(host=host, port=5000)