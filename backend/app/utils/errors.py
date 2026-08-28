"""Application exceptions."""

from __future__ import annotations

from typing import Any


class AppError(Exception):
    """Base application error with HTTP mapping."""

    status_code = 400
    code = "BAD_REQUEST"
    message = "Bad request."

    def __init__(
        self,
        message: str | None = None,
        *,
        details: dict[str, Any] | None = None,
        status_code: int | None = None,
        code: str | None = None,
    ) -> None:
        super().__init__(message or self.message)
        self.message = message or self.message
        self.details = details
        if status_code is not None:
            self.status_code = status_code
        if code is not None:
            self.code = code


class ValidationError(AppError):
    status_code = 422
    code = "VALIDATION_ERROR"
    message = "Validation failed."


class UnauthorizedError(AppError):
    status_code = 401
    code = "UNAUTHORIZED"
    message = "Authentication required."


class AccessTokenExpiredError(UnauthorizedError):
    code = "ACCESS_TOKEN_EXPIRED"
    message = "Access token has expired."


class AccessTokenInvalidError(UnauthorizedError):
    code = "ACCESS_TOKEN_INVALID"
    message = "Access token is invalid."


class ForbiddenError(AppError):
    status_code = 403
    code = "FORBIDDEN"
    message = "Forbidden."


class NotFoundError(AppError):
    status_code = 404
    code = "NOT_FOUND"
    message = "Resource not found."


class ConflictError(AppError):
    status_code = 409
    code = "CONFLICT"
    message = "Conflict."


class RegistrationConflictError(ConflictError):
    code = "REGISTRATION_CONFLICT"
    message = "Unable to complete registration."


class InvalidCredentialsError(UnauthorizedError):
    code = "INVALID_CREDENTIALS"
    message = "Invalid email or password."


class AccountLockedError(AppError):
    status_code = 429
    code = "ACCOUNT_LOCKED"
    message = "Account temporarily locked due to failed login attempts."


class RateLimitError(AppError):
    status_code = 429
    code = "RATE_LIMIT_EXCEEDED"
    message = "Too many requests."


class VaultRevisionConflictError(ConflictError):
    code = "VAULT_REVISION_CONFLICT"
    message = "Vault has been modified on another device."

    def __init__(self, *, current_revision: int | None, **kwargs: Any) -> None:
        details = {"current_revision": current_revision}
        super().__init__(self.message, details=details)


class PayloadTooLargeError(AppError):
    status_code = 413
    code = "PAYLOAD_TOO_LARGE"
    message = "Request payload is too large."


class RefreshTokenInvalidError(UnauthorizedError):
    code = "REFRESH_TOKEN_INVALID"
    message = "Refresh token is invalid."


class RefreshTokenReusedError(UnauthorizedError):
    code = "REFRESH_TOKEN_REUSED"
    message = "Refresh token reuse detected; session revoked."


class VaultNotFoundError(NotFoundError):
    code = "VAULT_NOT_FOUND"
    message = "Vault not found."
