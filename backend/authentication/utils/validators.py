import re
from django.core.exceptions import ValidationError


def validate_full_name(value):
    """
    Validate full name is between 3 and 60 characters.
    """
    if len(value) < 3 or len(value) > 60:
        raise ValidationError("Full name must be between 3 and 60 characters.")
    return value


def validate_mobile(value):
    """
    Validate uniquely formatted Indian mobile number (exactly 10 digits starting with 6-9).
    """
    pattern = r"^[6-9]\d{9}$"
    if not re.match(pattern, value):
        raise ValidationError("Krupa karine manya 10-ankno mobile number lakhsho (Mobile number must be a valid 10-digit number starting with 6, 7, 8 or 9).")
    return value


def validate_password_strength(value):
    """
    Validate password requirements:
    - Minimum 8 characters, maximum 20 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one number
    - At least one special character
    """
    if len(value) < 8 or len(value) > 20:
        raise ValidationError("Password must be between 8 and 20 characters long.")
    
    if not re.search(r"[A-Z]", value):
        raise ValidationError("Password must contain at least one uppercase letter.")
        
    if not re.search(r"[a-z]", value):
        raise ValidationError("Password must contain at least one lowercase letter.")
        
    if not re.search(r"\d", value):
        raise ValidationError("Password must contain at least one number.")
        
    # Special character list can match common symbols
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", value):
        raise ValidationError("Password must contain at least one special character.")
        
    return value
