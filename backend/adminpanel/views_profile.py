import re
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import BasePermission
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth import get_user_model
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.conf import settings
from .models import AdminProfile

User = get_user_model()

class IsAdminUserRole(BasePermission):
    """
    Permission class to ensure only authenticated users with Admin role
    or is_staff/is_superuser can access.
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            (request.user.role == 'Admin' or request.user.is_staff or request.user.is_superuser)
        )


class AdminProfileView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        user = request.user
        profile, created = AdminProfile.objects.get_or_create(user=user)
        
        # Build profile picture absolute URL or relative URL
        photo_url = None
        if profile.profile_picture:
            photo_url = request.build_absolute_uri(profile.profile_picture.url)

        return Response({
            "full_name": user.full_name,
            "email": user.email,
            "mobile": user.mobile,
            "username": profile.username or "",
            "role": user.role,
            "profile_picture": photo_url,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "last_login": user.last_login.isoformat() if user.last_login else None,
            "is_active": user.is_active,
            "language": profile.language,
            "theme": profile.theme
        }, status=status.HTTP_200_OK)

    def put(self, request):
        user = request.user
        profile, created = AdminProfile.objects.get_or_create(user=user)

        full_name = request.data.get('full_name', '').strip()
        email = request.data.get('email', '').strip()
        mobile = request.data.get('mobile', '').strip()
        username = request.data.get('username', '').strip()
        language = request.data.get('language', 'ENG').strip()
        theme = request.data.get('theme', 'Light').strip()

        errors = {}

        # Required fields validation
        if not full_name:
            errors['full_name'] = "Full name is required."
        if not email:
            errors['email'] = "Email is required."
        if not mobile:
            errors['mobile'] = "Mobile number is required."

        # Email validations
        if email:
            try:
                validate_email(email)
            except ValidationError:
                errors['email'] = "Invalid email format."
            
            # Unique email validation
            if not errors.get('email') and User.objects.filter(email=email).exclude(uuid=user.uuid).exists():
                errors['email'] = "This email is already in use."

        # Mobile validations
        if mobile:
            if not re.match(r'^\d{10}$', mobile):
                errors['mobile'] = "Mobile number must be exactly 10 digits."
            
            # Unique mobile validation
            if not errors.get('mobile') and User.objects.filter(mobile=mobile).exclude(uuid=user.uuid).exists():
                errors['mobile'] = "This mobile number is already in use."

        # Username validations
        if username:
            if AdminProfile.objects.filter(username=username).exclude(user=user).exists():
                errors['username'] = "This username is already taken."

        # Preferences values validation
        if language not in ['ENG', 'GUJ']:
            errors['language'] = "Language must be either ENG or GUJ."
        if theme not in ['Light', 'Dark']:
            errors['theme'] = "Theme must be either Light or Dark."

        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        # Save user fields
        user.full_name = full_name
        user.email = email
        user.mobile = mobile
        user.save()

        # Save profile fields
        profile.username = username
        profile.language = language
        profile.theme = theme
        profile.save()

        # Return updated details
        photo_url = None
        if profile.profile_picture:
            photo_url = request.build_absolute_uri(profile.profile_picture.url)

        return Response({
            "full_name": user.full_name,
            "email": user.email,
            "mobile": user.mobile,
            "username": profile.username or "",
            "role": user.role,
            "profile_picture": photo_url,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "last_login": user.last_login.isoformat() if user.last_login else None,
            "is_active": user.is_active,
            "language": profile.language,
            "theme": profile.theme
        }, status=status.HTTP_200_OK)


class AdminChangePasswordView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUserRole]

    def patch(self, request):
        user = request.user
        current_password = request.data.get('current_password', '')
        new_password = request.data.get('new_password', '')
        confirm_password = request.data.get('confirm_password', '')

        errors = {}

        if not current_password:
            errors['current_password'] = "Current password is required."
        if not new_password:
            errors['new_password'] = "New password is required."
        if not confirm_password:
            errors['confirm_password'] = "Password confirmation is required."

        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        # Verify current password
        if not user.check_password(current_password):
            return Response({"current_password": "Incorrect current password."}, status=status.HTTP_400_BAD_REQUEST)

        # Passwords mismatch check
        if new_password != confirm_password:
            return Response({"confirm_password": "New passwords do not match."}, status=status.HTTP_400_BAD_REQUEST)

        # Strong password strength checks
        password_errors = []
        if len(new_password) < 8:
            password_errors.append("Password must be at least 8 characters long.")
        if not any(c.isupper() for c in new_password):
            password_errors.append("Password must contain at least one uppercase letter.")
        if not any(c.islower() for c in new_password):
            password_errors.append("Password must contain at least one lowercase letter.")
        if not any(c.isdigit() for c in new_password):
            password_errors.append("Password must contain at least one number.")
        if not any(c in "!@#$%^&*()-_=+[]{}|;:'\",.<>/?`~" for c in new_password):
            password_errors.append("Password must contain at least one special character.")

        if password_errors:
            return Response({"new_password": password_errors}, status=status.HTTP_400_BAD_REQUEST)

        # Update password
        user.set_password(new_password)
        user.save()

        return Response({"message": "Password changed successfully."}, status=status.HTTP_200_OK)


class AdminProfilePhotoView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUserRole]

    def post(self, request):
        user = request.user
        profile, created = AdminProfile.objects.get_or_create(user=user)

        photo = request.FILES.get('profile_picture')
        if not photo:
            return Response({"profile_picture": "Profile picture file is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Delete the old photo from storage if exists
        if profile.profile_picture:
            profile.profile_picture.delete(save=False)

        profile.profile_picture = photo
        profile.save()

        photo_url = request.build_absolute_uri(profile.profile_picture.url)
        return Response({
            "message": "Profile photo uploaded successfully.",
            "profile_picture": photo_url
        }, status=status.HTTP_200_OK)

    def delete(self, request):
        user = request.user
        profile, created = AdminProfile.objects.get_or_create(user=user)

        if profile.profile_picture:
            profile.profile_picture.delete(save=True)

        return Response({
            "message": "Profile photo removed successfully.",
            "profile_picture": None
        }, status=status.HTTP_200_OK)
