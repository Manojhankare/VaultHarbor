"""Pydantic validation helpers."""

from __future__ import annotations

from typing import Any, TypeVar

from pydantic import BaseModel, ValidationError as PydanticValidationError

from app.utils.errors import ValidationError

T = TypeVar("T", bound=BaseModel)


def _json_safe_errors(errors: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Strip non-JSON-serializable objects from Pydantic error dicts."""
    safe: list[dict[str, Any]] = []
    for err in errors:
        item = dict(err)
        ctx = item.get("ctx")
        if isinstance(ctx, dict):
            item["ctx"] = {
                key: str(value) if isinstance(value, BaseException) else value
                for key, value in ctx.items()
            }
        safe.append(item)
    return safe


def parse_payload(model: type[T], data: dict | None) -> T:
    if data is None:
        raise ValidationError("Request body must be JSON.", details={"field": "body"})
    try:
        return model.model_validate(data)
    except PydanticValidationError as exc:
        raise ValidationError(
            "Validation failed.",
            details={"errors": _json_safe_errors(exc.errors(include_url=False))},
        ) from exc
