"""API documentation routes."""

from __future__ import annotations

from flask import Blueprint, current_app, render_template_string

from app.docs.openapi import build_openapi_spec

docs_bp = Blueprint("docs", __name__, url_prefix="/api")


SWAGGER_UI = """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>VaultHarbor API Docs</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      SwaggerUIBundle({
        url: '/api/openapi.json',
        dom_id: '#swagger-ui',
      });
    };
  </script>
</body>
</html>
"""


@docs_bp.get("/openapi.json")
def openapi_json():
    if not current_app.config.get("ENABLE_API_DOCS"):
        return {"error": {"code": "NOT_FOUND", "message": "Not found."}}, 404
    return build_openapi_spec()


@docs_bp.get("/docs")
def swagger_ui():
    if not current_app.config.get("ENABLE_API_DOCS"):
        return {"error": {"code": "NOT_FOUND", "message": "Not found."}}, 404
    return render_template_string(SWAGGER_UI)
