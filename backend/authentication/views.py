from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework.exceptions import ValidationError, AuthenticationFailed

from authentication.serializers import (
    RegisterSerializer,
    LoginSerializer,
    LogoutSerializer,
    ProfileUpdateSerializer,
    ForgotPasswordSerializer,
    VerifyOTPSerializer,
    ResetPasswordSerializer,
    UserSerializer,
    VerifyRegistrationOTPSerializer,
    ResendRegistrationOTPSerializer,
)
from authentication.services.auth_service import AuthService
from authentication.services.jwt_service import JWTService
from authentication.utils.response import success_response, error_response


class PingAuthenticationView(APIView):
    """
    GET /api/auth/ping
    Health check endpoint for authentication backend.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        return success_response(
            message="Authentication service is online.",
            data={"status": "healthy"},
            status_code=status.HTTP_200_OK
        )


class RegisterView(APIView):
    """
    POST /api/auth/register
    Creates a new user profile and sends a verification OTP to their email.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                message="Validation failed",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )

        try:
            result = AuthService.register_user(serializer.validated_data)
            user = result['user']
            user_data = UserSerializer(user).data
            user_data['masked_email'] = result['masked_email']
            return success_response(
                message="Registration successful. Verification OTP sent to your registered email.",
                data=user_data,
                status_code=status.HTTP_201_CREATED
            )
        except ValidationError as ve:
            return error_response(
                message="Registration failed",
                errors=ve.detail if hasattr(ve, 'detail') else {"error": str(ve)},
                status_code=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return error_response(
                message="Server error during registration",
                errors={"server": str(e)},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class VerifyRegistrationOTPView(APIView):
    """
    POST /api/auth/verify-registration-otp
    Verifies the registration OTP and marks the user as verified.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyRegistrationOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                message="Validation failed",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )

        try:
            AuthService.verify_registration_otp(
                mobile=serializer.validated_data['mobile'],
                otp_code=serializer.validated_data['otp_code']
            )
            return success_response(
                message="Email verified successfully. You can now login.",
                data={}
            )
        except ValidationError as ve:
            msg = str(ve.detail[0] if isinstance(ve.detail, list) else (
                ve.detail.get('non_field_errors', [str(ve)])[0]
                if isinstance(ve.detail, dict) else str(ve)
            ))
            return error_response(
                message=msg,
                errors=ve.detail if hasattr(ve, 'detail') else {"error": str(ve)},
                status_code=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return error_response(
                message="Server error during OTP verification",
                errors={"server": str(e)},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ResendRegistrationOTPView(APIView):
    """
    POST /api/auth/resend-registration-otp
    Resends the registration OTP with rate-limiting protection.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResendRegistrationOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                message="Validation failed",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )

        try:
            AuthService.resend_registration_otp(
                mobile=serializer.validated_data['mobile']
            )
            return success_response(
                message="A new OTP has been sent to your registered email address.",
                data={}
            )
        except ValidationError as ve:
            msg = str(ve.detail[0] if isinstance(ve.detail, list) else (
                ve.detail.get('non_field_errors', [str(ve)])[0]
                if isinstance(ve.detail, dict) else str(ve)
            ))
            return error_response(
                message=msg,
                errors=ve.detail if hasattr(ve, 'detail') else {"error": str(ve)},
                status_code=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return error_response(
                message="Server error during OTP resend",
                errors={"server": str(e)},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LoginView(APIView):
    """
    POST /api/auth/login
    Authenticates a user and generates JWT access and refresh tokens.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                message="Validation failed",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )

        try:
            auth_data = AuthService.authenticate_user(
                credential=serializer.validated_data['credential'],
                password_raw=serializer.validated_data['password'],
                role_scope=serializer.validated_data['role']
            )
            return success_response(
                message="Login successful",
                data=auth_data,
                status_code=status.HTTP_200_OK
            )
        except ValidationError as ve:
            errs = ve.detail if hasattr(ve, 'detail') else {"error": str(ve)}
            msg = errs[0] if isinstance(errs, list) else (errs.get('non_field_errors', [str(ve)])[0] if isinstance(errs, dict) else str(ve))
            return error_response(
                message=str(msg),
                errors=errs,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        except AuthenticationFailed as af:
            return error_response(
                message=str(af.detail),
                errors={"error": str(af.detail)},
                status_code=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            return error_response(
                message="Server error during authentication",
                errors={"server": str(e)},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LogoutView(APIView):
    """
    POST /api/auth/logout
    Invalidates the User's JWT refresh token.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                message="Validation failed",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )

        try:
            blacklisted = JWTService.blacklist_refresh_token(serializer.validated_data['refresh'])
            if blacklisted:
                return success_response(
                    message="Logout successful. Token invalidated.",
                    data={},
                    status_code=status.HTTP_200_OK
                )
            else:
                return error_response(
                    message="Invalid refresh token or token already expired/invalidated.",
                    status_code=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            return error_response(
                message="Server error during logout",
                errors={"server": str(e)},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ProfileView(APIView):
    """
    GET /api/auth/profile
    Retrieves the currently authenticated user's profile details.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user_data = UserSerializer(request.user).data
            return success_response(
                message="Profile fetched successfully",
                data=user_data,
                status_code=status.HTTP_200_OK
            )
        except Exception as e:
            return error_response(
                message="Server error during profile retrieval",
                errors={"server": str(e)},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ProfileUpdateView(APIView):
    """
    PUT /api/auth/profile/update
    Updates the authenticated user's profile contents.
    """
    permission_classes = [IsAuthenticated]

    def put(self, request):
        serializer = ProfileUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                message="Validation failed",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )

        try:
            updated_user = AuthService.update_profile(request.user, serializer.validated_data)
            user_data = UserSerializer(updated_user).data
            return success_response(
                message="Profile updated successfully",
                data=user_data,
                status_code=status.HTTP_200_OK
            )
        except ValidationError as ve:
            return error_response(
                message="Profile update failed",
                errors=ve.detail if hasattr(ve, 'detail') else {"error": str(ve)},
                status_code=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return error_response(
                message="Server error during profile update",
                errors={"server": str(e)},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ForgotPasswordView(APIView):
    """
    POST /api/auth/forgot-password
    Generates and sends recovery OTP to User's registered email.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                message="Validation failed",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )

        try:
            AuthService.request_forgot_password(serializer.validated_data['mobile'])
            return success_response(
                message="Verification OTP sent to your registered email address.",
                data={}
            )
        except ValidationError as ve:
            return error_response(
                message=str(ve.detail[0] if isinstance(ve.detail, list) else (ve.detail.get('non_field_errors', [str(ve)])[0] if isinstance(ve.detail, dict) else str(ve))),
                errors=ve.detail if hasattr(ve, 'detail') else {"error": str(ve)},
                status_code=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return error_response(
                message="Server error during password recovery request",
                errors={"server": str(e)},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class VerifyOTPView(APIView):
    """
    POST /api/auth/verify-otp
    Checks the recovery code corresponding to the mobile. Returns reset_token on success.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                message="Validation failed",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )

        try:
            reset_token = AuthService.verify_forgot_password_otp(
                mobile=serializer.validated_data['mobile'],
                otp_code=serializer.validated_data['otp_code']
            )
            return success_response(
                message="OTP verified successfully.",
                data={"reset_token": reset_token}
            )
        except ValidationError as ve:
            return error_response(
                message="OTP verification failed",
                errors=ve.detail if hasattr(ve, 'detail') else {"error": str(ve)},
                status_code=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return error_response(
                message="Server error during OTP verification",
                errors={"server": str(e)},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ResetPasswordView(APIView):
    """
    POST /api/auth/reset-password
    Resets password after OTP confirmation — requires valid reset_token.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                message="Validation failed",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )

        try:
            AuthService.reset_password(
                mobile=serializer.validated_data['mobile'],
                new_password_raw=serializer.validated_data['new_password'],
                reset_token=serializer.validated_data['reset_token']
            )
            return success_response(
                message="Password reset successful. You may now login.",
                data={}
            )
        except ValidationError as ve:
            return error_response(
                message="Password reset failed",
                errors=ve.detail if hasattr(ve, 'detail') else {"error": str(ve)},
                status_code=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return error_response(
                message="Server error during password reset",
                errors={"server": str(e)},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ── Temporary Secure Admin Creation Endpoint ──────────────────────────
from django.http import HttpResponse, HttpResponseForbidden
from django.views.decorators.http import require_GET
from users.models import User


@require_GET
def create_admin_view(request):
    """
    GET /create-admin/?key=FARMVERSE2026
    Temporary endpoint to bootstrap a superuser in production.
    Remove this view and its URL entry after first use.
    """
    if request.GET.get('key') != 'FARMVERSE2026':
        return HttpResponseForbidden('Forbidden')

    if User.objects.filter(email='farmverse079@gmail.com').exists():
        return HttpResponse('Admin already exists')

    User.objects.create_superuser(
        mobile='7984087441',
        email='farmverse079@gmail.com',
        full_name='Naimish Gondaliya',
        password='Admin@123',
    )
    return HttpResponse('Admin created successfully')
class DebugEmailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        import os
        from django.conf import settings
        from django.core.mail import send_mail
        from .utils.response import success_response

        user = getattr(settings, 'EMAIL_HOST_USER', None)
        pwd = getattr(settings, 'EMAIL_HOST_PASSWORD', None)

        debug_info = {
            'EMAIL_BACKEND': getattr(settings, 'EMAIL_BACKEND', None),
            'EMAIL_HOST': getattr(settings, 'EMAIL_HOST', None),
            'EMAIL_PORT': getattr(settings, 'EMAIL_PORT', None),
            'EMAIL_USE_TLS': getattr(settings, 'EMAIL_USE_TLS', None),
            'EMAIL_HOST_USER': user,
            'HAS_EMAIL_HOST_PASSWORD': bool(pwd),
            'DEFAULT_FROM_EMAIL': getattr(settings, 'DEFAULT_FROM_EMAIL', None),
            'os_environ_USER': os.environ.get('EMAIL_HOST_USER'),
            'os_environ_HAS_PWD': bool(os.environ.get('EMAIL_HOST_PASSWORD')),
        }

        error_type = None
        error_str = None
        email_sent = False

        if user:
            try:
                send_mail(
                    'FarmVerse Debug SMTP Test',
                    'This is a debug test from the API View.',
                    getattr(settings, 'DEFAULT_FROM_EMAIL', user),
                    [user],
                    fail_silently=False
                )
                email_sent = True
            except Exception as e:
                error_type = type(e).__name__
                error_str = str(e)
                print('DEBUG API EMAIL ERROR:', error_type, error_str)

        debug_info['email_sent_successfully'] = email_sent
        if error_type:
            debug_info['error_type'] = error_type
            debug_info['error_str'] = error_str

        return success_response(message='Debug execution completed', data=debug_info)
