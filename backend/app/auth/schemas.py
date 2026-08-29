"""Auth request/response schemas."""

from __future__ import annotations

import re
import uuid
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, field_validator

PASSWORD_MIN_LENGTH = 12
PASSWORD_PATTERN = re.compile(
    r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$"
)


class KdfDescriptor(BaseModel):
    algorithm: Literal["pbkdf2-sha256", "argon2id"] = "pbkdf2-sha256"
    iterations: int = Field(default=600_000, ge=100_000, le=2_000_000)
    memory_kib: int | None = Field(default=None, ge=1024, le=524_288)
    parallelism: int | None = Field(default=None, ge=1, le=16)
    salt: str = Field(min_length=16, max_length=512)

    @field_validator("salt")
    @classmethod
    def validate_salt(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("salt must not be empty")
        return value


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=PASSWORD_MIN_LENGTH, max_length=128)
    kdf: KdfDescriptor | None = None

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        if not PASSWORD_PATTERN.match(value):
            raise ValueError(
                "password must include upper, lower, digit, and special character"
            )
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)
    device_id: uuid.UUID | None = None


class RefreshRequest(BaseModel):
    refresh_token: str = Field(min_length=16, max_length=512)


class LogoutRequest(BaseModel):
    refresh_token: str | None = Field(default=None, min_length=16, max_length=512)
    all_devices: bool = False


class AuthTokensResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in: int


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    is_active: bool
    created_at: str
    last_login_at: str | None
    kdf: KdfDescriptor


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str = Field(min_length=6, max_length=32)
    new_password: str = Field(min_length=PASSWORD_MIN_LENGTH, max_length=128)

    @field_validator("new_password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        if not PASSWORD_PATTERN.match(value):
            raise ValueError(
                "password must include upper, lower, digit, and special character"
            )
        return value

    @field_validator("code")
    @classmethod
    def normalize_code(cls, value: str) -> str:
        return value.strip().upper().replace("-", "").replace(" ", "")
