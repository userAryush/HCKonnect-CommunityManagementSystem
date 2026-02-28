from django.conf import settings
from django.core.exceptions import PermissionDenied
from google.oauth2 import id_token
from google.auth.transport import requests
from rest_framework import exceptions
from .models import User

class GoogleAuthService:
    @staticmethod
    def verify_google_id_token(token):
        try:
            # Verify the ID token from Google
            id_info = id_token.verify_oauth2_token(
                token, 
                requests.Request(), 
                settings.GOOGLE_CLIENT_ID
            )

            # 1. Check if email is verified
            if not id_info.get('email_verified'):
                raise exceptions.AuthenticationFailed("Email not verified by Google.")

            # 2. Domain restriction: Only @heraldcollege.edu.np
            email = id_info.get('email')
            if not email.endswith('@heraldcollege.edu.np'):
                raise exceptions.PermissionDenied("Access restricted to Herald College emails only.")

            return id_info

        except ValueError:
            # Invalid token
            raise exceptions.AuthenticationFailed("Invalid Google token.")
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
            user.must_change_password = False
            user.save()
            
        return user
