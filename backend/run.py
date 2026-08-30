"""Local development entrypoint.

VaultHarbor backend — Manoj Hankare (https://manojhankare.in)
"""

from app.config import bootstrap_env

bootstrap_env()

from app import create_app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
