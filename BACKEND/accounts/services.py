from django.conf import settings
from google.oauth2 import id_token
from google.auth.transport import requests
from rest_framework import exceptions
from .models import User
import requests as http_requests

class GoogleAuthService:
    @staticmethod
    def _validate_google_profile(profile):
        if not profile.get('email_verified'):
            raise exceptions.AuthenticationFailed("Email not verified by Google.")

        email = profile.get('email')
        if not email or not email.endswith('@heraldcollege.edu.np'):
            raise exceptions.PermissionDenied("Access restricted to Herald College emails only.")

        return profile

    @staticmethod
    def verify_google_id_token(token):
        try:
            id_info = id_token.verify_oauth2_token(
                token, 
                requests.Request(), 
                settings.GOOGLE_CLIENT_ID
            )
            return GoogleAuthService._validate_google_profile(id_info)

        except ValueError:
            raise exceptions.AuthenticationFailed("Invalid Google token.")
        except Exception as e:
            if isinstance(e, (exceptions.AuthenticationFailed, exceptions.PermissionDenied)):
                raise e
            raise exceptions.AuthenticationFailed(f"Google authentication failed: {str(e)}")

    @staticmethod
    def verify_google_access_token(token):
        try:
            response = http_requests.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                headers={'Authorization': f'Bearer {token}'},
                timeout=10,
            )
            if response.status_code != 200:
                raise exceptions.AuthenticationFailed("Invalid Google access token.")

            profile = response.json()
            return GoogleAuthService._validate_google_profile(profile)
        except Exception as e:
            if isinstance(e, (exceptions.AuthenticationFailed, exceptions.PermissionDenied)):
                raise e
            raise exceptions.AuthenticationFailed(f"Google authentication failed: {str(e)}")

    @staticmethod
    def get_or_create_user(id_info):
        email = id_info.get('email')
        username = id_info.get('email').split('@')[0]
        first_name = id_info.get('given_name', '')
        last_name = id_info.get('family_name', '')
        
        # Check if user exists
        user = User.objects.filter(email=email).first()
        
        if not user:
            # Create new user
            user = User.objects.create_user(
                email=email,
                username=username,
                first_name=first_name,
                last_name=last_name,
                role='student' # Default role
            )
            # Since it's social login, they don't necessarily MUST change password 
            # if we didn't set one, but the model has a default True.
            # We might want to set it to False for social users.
            user.set_unusable_password()
            user.must_change_password = False
            user.save()
            
        return user
