"""WSGI entrypoint for Gunicorn and Vercel.

VaultHarbor backend — Manoj Hankare (https://manojhankare.in)
"""

from __future__ import annotations

import sys
import traceback

try:
    try:
        from dotenv import load_dotenv

        load_dotenv()
    except ImportError:
        # Vercel injects env vars directly; dotenv is optional at runtime.
        pass

    from app import create_app

    app = create_app()
except Exception:
    traceback.print_exc(file=sys.stderr)
    raise
