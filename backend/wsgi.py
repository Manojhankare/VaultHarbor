"""WSGI entrypoint for Gunicorn and Vercel."""

from __future__ import annotations

import sys
import traceback

try:
    from dotenv import load_dotenv

    load_dotenv()

    from app import create_app

    app = create_app()
except Exception:
    traceback.print_exc(file=sys.stderr)
    raise
