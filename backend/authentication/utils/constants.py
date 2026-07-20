# Role Choices Definitions
ROLE_FARMER = 'Farmer'
ROLE_EXPERT = 'Expert'
ROLE_ADMIN = 'Admin'

ROLE_CHOICES = (
    (ROLE_FARMER, 'Farmer'),
    (ROLE_EXPERT, 'Expert'),
    (ROLE_ADMIN, 'Admin'),
)

# Time constants
OTP_EXPIRY_MINUTES = 5
JWT_ACCESS_EXPIRY_MINUTES = 30
JWT_REFRESH_EXPIRY_DAYS = 7
