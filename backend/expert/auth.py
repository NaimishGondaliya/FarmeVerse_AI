from rest_framework.authentication import BaseAuthentication
from rest_framework import exceptions
from rest_framework_simplejwt.tokens import AccessToken
from expert.models import AgricultureExpert


class ExpertJWTAuthentication(BaseAuthentication):
    """
    Custom JWT Authentication class for the Expert portal.
    Extracts user_id from the SimpleJWT token claim and verifies if 
    an AgricultureExpert exists with that ID and has active status.
    """
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return None

        token_str = parts[1]
        try:
            token = AccessToken(token_str)
            user_id = token.get('user_id')
            role = token.get('role')

            if role != 'Expert':
                raise exceptions.AuthenticationFailed('Token does not have Expert role permissions.')

            expert = AgricultureExpert.objects.filter(id=user_id, active_status=True).first()
            if not expert:
                raise exceptions.AuthenticationFailed('Expert account not found or is currently inactive.')

            return (expert, token)
        except exceptions.AuthenticationFailed as ae:
            raise ae
        except Exception:
            raise exceptions.AuthenticationFailed('Invalid or expired Expert authentication token.')
