"""Auth routes."""

from __future__ import annotations

from flask import Blueprint, g, request

from app.auth import service
from app.auth.schemas import (
    ForgotPasswordRequest,
    LoginRequest,
    LogoutRequest,
    RefreshRequest,
    RegisterRequest,
    ResetPasswordRequest,
)
from app.extensions import limiter
from app.security.auth import require_auth
from app.utils.responses import success_response
from app.utils.validation import parse_payload

auth_bp = Blueprint("auth", __name__, url_prefix="/api/v1/auth")


@auth_bp.post("/register")
@limiter.limit("10 per minute")
def register():
    payload = parse_payload(RegisterRequest, request.get_json(silent=True))
    user = service.register_user(payload)
    return success_response({"user": user.model_dump()}, status=201)


@auth_bp.post("/login")
@limiter.limit("20 per minute")
def login():
    payload = parse_payload(LoginRequest, request.get_json(silent=True))
    tokens = service.login_user(
        email=str(payload.email),
        password=payload.password,
        device_id=payload.device_id,
    )
    return success_response(tokens.model_dump())


@auth_bp.post("/refresh")
@limiter.limit("30 per minute")
def refresh():
    payload = parse_payload(RefreshRequest, request.get_json(silent=True))
    tokens = service.refresh_tokens(payload.refresh_token)
    return success_response(tokens.model_dump())


@auth_bp.post("/logout")
@require_auth
def logout():
    payload = parse_payload(LogoutRequest, request.get_json(silent=True) or {})
    service.logout_user(
        user_id=g.current_user.id,
        refresh_token=payload.refresh_token,
        all_devices=payload.all_devices,
    )
    return success_response(status=204)


@auth_bp.get("/me")
@require_auth
def me():
    user = service.get_user_profile(g.current_user.id)
    return success_response({"user": user.model_dump()})


@auth_bp.post("/forgot-password")
@limiter.limit("3 per minute")
def forgot_password():
    payload = parse_payload(ForgotPasswordRequest, request.get_json(silent=True))
    service.request_password_reset(str(payload.email))
    return success_response(
        {"message": "If an account exists for this email, a reset code has been sent."},
        status=202,
    )


@auth_bp.post("/reset-password")
@limiter.limit("10 per minute")
def reset_password():
    payload = parse_payload(ResetPasswordRequest, request.get_json(silent=True))
    service.reset_password(
        email=str(payload.email),
        code=payload.code,
        new_password=payload.new_password,
    )
    return success_response(status=204)
