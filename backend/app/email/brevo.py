"""Brevo (Sendinblue) transactional email sender."""

from __future__ import annotations

from flask import current_app

from app.email.base import EmailMessage
from app.email.http import post_json


class BrevoEmailSender:
    def send(self, message: EmailMessage) -> None:
        api_key = current_app.config["EMAIL_API_KEY"]
        if not api_key:
            raise RuntimeError("EMAIL_API_KEY is required for Brevo.")

        payload: dict[str, object] = {
            "sender": {
                "name": current_app.config["EMAIL_FROM_NAME"],
                "email": current_app.config["EMAIL_FROM_ADDRESS"],
            },
            "to": [{"email": message.to_email}],
            "subject": message.subject,
            "textContent": message.text_body,
        }
        if message.html_body:
            payload["htmlContent"] = message.html_body

        current_app.logger.info(
            "Brevo send to %s from %s <%s>",
            message.to_email,
            current_app.config["EMAIL_FROM_NAME"],
            current_app.config["EMAIL_FROM_ADDRESS"],
        )

        post_json(
            "https://api.brevo.com/v3/smtp/email",
            headers={"api-key": api_key},
            payload=payload,
            timeout_seconds=current_app.config["EMAIL_TIMEOUT_SECONDS"],
        )
