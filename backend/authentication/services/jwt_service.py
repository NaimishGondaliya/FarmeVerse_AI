from rest_framework_simplejwt.tokens import RefreshToken


class JWTService:
    """
    Service wrapper for SimpleJWT to manage user authentication tokens.
    """
    @staticmethod
    def generate_tokens_for_user(user) -> dict:
        """
        Generate access and refresh tokens for a User instance.
        Inject custom claims if needed.
        """
        refresh = RefreshToken.for_user(user)
        
        # Include custom claims in the token payload
        refresh['role'] = user.role
        refresh['email'] = user.email
        refresh['full_name'] = user.full_name
        
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }

    @staticmethod
    def blacklist_refresh_token(token_val: str) -> bool:
        """
        Blacklist a refresh token to invalidate it (used in logout).
        """
        try:
            token = RefreshToken(token_val)
            token.blacklist()
            return True
        except Exception:
            # Token might be already invalid or expired, return False
            return False
