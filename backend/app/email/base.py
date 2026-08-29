"""Email sender protocol and message types."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class EmailMessage:
    to_email: str
    subject: str
    text_body: str
    html_body: str | None = None


class EmailSender(Protocol):
    def send(self, message: EmailMessage) -> None: ...
