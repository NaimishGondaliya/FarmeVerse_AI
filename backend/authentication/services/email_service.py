import logging
import socket
from smtplib import SMTPException, SMTPAuthenticationError
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)


class EmailService:
    """
    Service to handle SMTP email operations, particularly transactional OTP notifications.
    """
    @staticmethod
    def send_otp_email(email_address: str, otp_code: str) -> bool:
        """
        Send OTP verification code to a specified email address.
        """
        subject = "FarmVerse AI - OTP Verification Code"
        message = (
            f"Welcome to FarmVerse AI!\n\n"
            f"Your OTP code is: {otp_code}\n"
            f"This code will expire in 5 minutes.\n\n"
            f"If you did not request this, please ignore this email.\n"
            f"FarmVerse AI Support Team"
        )
        recipient_list = [email_address]
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', '')

        if not from_email:
            logger.error("SMTP Configuration Error: DEFAULT_FROM_EMAIL is not set.")
            return False

        try:
            sent_count = send_mail(
                subject=subject,
                message=message,
                from_email=from_email,
                recipient_list=recipient_list,
                fail_silently=False,
            )
            if sent_count > 0:
                logger.info(f"Verification OTP email dispatched successfully to {email_address}")
                return True
            else:
                logger.error(f"Email failed to send to {email_address} (returned 0)")
                return False
        except SMTPAuthenticationError as e:
            logger.error(f"SMTP Authentication failed to {email_address}. Check App Password. Error: {str(e)}")
            return False
        except SMTPException as e:
            logger.error(f"SMTP Exception while connecting/sending to {email_address}: {str(e)}")
            return False
        except (socket.timeout, TimeoutError):
            logger.error(f"SMTP Connection Timeout. Email to {email_address} dropped. Check network port / Render rules.")
            return False
        except OSError as e:
            logger.error(f"OS/Network error sending email to {email_address}. Possible rendering block: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"Failed to send OTP email to {email_address}: {str(e)}")
            return False
