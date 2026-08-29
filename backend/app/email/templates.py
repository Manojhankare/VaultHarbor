"""Transactional email templates."""

from __future__ import annotations


def password_reset_email(*, code: str, ttl_minutes: int) -> tuple[str, str, str]:
    subject = "VaultSync password reset code"
    text = (
        f"Your VaultSync password reset code is: {code}\n\n"
        f"This code expires in {ttl_minutes} minutes.\n\n"
        "If you did not request this, you can ignore this email.\n\n"
        "— VaultSync · manojhankare.in"
    )
    html = (
        f"<p>Your VaultSync password reset code is:</p>"
        f"<p style=\"font-size:24px;font-weight:bold;letter-spacing:0.2em;\">{code}</p>"
        f"<p>This code expires in {ttl_minutes} minutes.</p>"
        f"<p>If you did not request this, you can ignore this email.</p>"
        f"<p>— VaultSync · <a href=\"https://manojhankare.in\">manojhankare.in</a></p>"
    )
    return subject, text, html
