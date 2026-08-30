"""WSGI entrypoint for Gunicorn and Vercel.

VaultHarbor backend — Manoj Hankare (https://manojhankare.in)
"""

from __future__ import annotations

import sys
import traceback

try:
    from app.config import bootstrap_env

    bootstrap_env()

    from app import create_app

    app = create_app()
except Exception:
    traceback.print_exc(file=sys.stderr)
    raise
