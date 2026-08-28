"""Pydantic validation helpers."""

from __future__ import annotations

from typing import TypeVar

from pydantic import BaseModel, ValidationError as PydanticValidationError

from app.utils.errors import ValidationError

T = TypeVar("T", bound=BaseModel)


def parse_payload(model: type[T], data: dict | None) -> T:
    if data is None:
        raise ValidationError("Request body must be JSON.", details={"field": "body"})
    try:
        return model.model_validate(data)
    except PydanticValidationError as exc:
        raise ValidationError(
            "Validation failed.",
            details={"errors": exc.errors(include_url=False)},
        ) from exc
