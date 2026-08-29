"""Development email sender — logs reset codes to stdout."""

from __future__ import annotations

from flask import current_app

from app.email.base import EmailMessage


class ConsoleEmailSender:
    def __init__(self) -> None:
        if not current_app.debug and not current_app.testing:
            raise RuntimeError(
                "Console email sender is only allowed in development/testing. "
                "Set EMAIL_PROVIDER=brevo (or resend) in production."
            )

    def send(self, message: EmailMessage) -> None:
        # Use print — logging redacts messages containing "password".
        print(
            f"[VaultSync dev email] to={message.to_email}\n{message.text_body}",
            flush=True,
        )
