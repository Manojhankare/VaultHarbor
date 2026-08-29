"""Amazon SES email sender (stub — implement via boto3 or SMTP when needed)."""

from __future__ import annotations

from app.email.base import EmailMessage


class SesEmailSender:
    def send(self, message: EmailMessage) -> None:
        raise NotImplementedError(
            "Amazon SES sender is not implemented yet. "
            "Use EMAIL_PROVIDER=brevo or resend, or add boto3 SES integration."
        )
