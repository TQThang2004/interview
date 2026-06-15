import asyncio
import logging
import smtplib
from email.message import EmailMessage

from app.core.config import (
    SMTP_FROM_EMAIL,
    SMTP_HOST,
    SMTP_PASSWORD,
    SMTP_PORT,
    SMTP_USERNAME,
    SMTP_USE_TLS,
)

logger = logging.getLogger(__name__)


def is_email_enabled() -> bool:
    return bool(SMTP_HOST and SMTP_FROM_EMAIL)


def _send_email_sync(to_email: str, subject: str, body: str) -> None:
    message = EmailMessage()
    message["From"] = SMTP_FROM_EMAIL
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(body)

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as smtp:
        if SMTP_USE_TLS:
            smtp.starttls()
        if SMTP_USERNAME:
            smtp.login(SMTP_USERNAME, SMTP_PASSWORD)
        smtp.send_message(message)


async def send_email(to_email: str | None, subject: str, body: str) -> bool:
    if not to_email or not is_email_enabled():
        return False
    try:
        await asyncio.to_thread(_send_email_sync, to_email, subject, body)
        return True
    except Exception:
        logger.exception("Failed to send email to %s", to_email)
        return False
