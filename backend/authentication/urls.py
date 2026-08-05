from django.urls import path
from .views import (
    PingAuthenticationView,
    RegisterView,
    LoginView,
    LogoutView,
    ProfileView,
    ProfileUpdateView,
    ForgotPasswordView,
    VerifyOTPView,
    ResetPasswordView,
    VerifyRegistrationOTPView,
    ResendRegistrationOTPView,
    DebugEmailView,
)

app_name = 'authentication'

urlpatterns = [
    path('ping/', PingAuthenticationView.as_view(), name='ping'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/update/', ProfileUpdateView.as_view(), name='profile_update'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    path('verify-registration-otp/', VerifyRegistrationOTPView.as_view(), name='verify_registration_otp'),
    path('resend-registration-otp/', ResendRegistrationOTPView.as_view(), name='resend_registration_otp'),
    path('debug-email/', DebugEmailView.as_view(), name='debug_email'),
]
