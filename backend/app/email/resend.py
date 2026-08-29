"""Resend transactional email sender."""

from __future__ import annotations

from flask import current_app

from app.email.base import EmailMessage
from app.email.http import post_json


class ResendEmailSender:
    def send(self, message: EmailMessage) -> None:
        api_key = current_app.config["EMAIL_API_KEY"]
        if not api_key:
            raise RuntimeError("EMAIL_API_KEY is required for Resend.")

        payload: dict[str, object] = {
            "from": (
                f"{current_app.config['EMAIL_FROM_NAME']} "
                f"<{current_app.config['EMAIL_FROM_ADDRESS']}>"
            ),
            "to": [message.to_email],
            "subject": message.subject,
            "text": message.text_body,
        }
        if message.html_body:
            payload["html"] = message.html_body

        post_json(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {api_key}"},
            payload=payload,
            timeout_seconds=current_app.config["EMAIL_TIMEOUT_SECONDS"],
        )
