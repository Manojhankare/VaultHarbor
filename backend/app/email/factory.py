"""Email sender factory."""

from __future__ import annotations

from flask import current_app

from app.email.base import EmailSender
from app.email.brevo import BrevoEmailSender
from app.email.console import ConsoleEmailSender
from app.email.resend import ResendEmailSender
from app.email.ses import SesEmailSender


def get_email_sender() -> EmailSender:
    provider = (current_app.config.get("EMAIL_PROVIDER") or "console").lower()
    if provider == "brevo":
        return BrevoEmailSender()
    if provider == "resend":
        return ResendEmailSender()
    if provider == "ses":
        return SesEmailSender()
    return ConsoleEmailSender()
