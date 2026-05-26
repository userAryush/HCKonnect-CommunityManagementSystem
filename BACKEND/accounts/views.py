from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import (
    RegisterSerializer, LoginSerializer, ForgotPasswordSerializer, 
    VerifyOTPSerializer, ResetPasswordSerializer, UserProfileSerializer, 
    UserProfileDetailSerializer, GlobalSearchSerializer, GoogleAuthSerializer,
    ChangePasswordSerializer, ContactUsMessageSerializer, ThemePreferenceSerializer
)
from django.db.models import Q
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.generics import RetrieveUpdateAPIView, RetrieveAPIView
from .models import User
from .services import GoogleAuthService
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework.exceptions import ValidationError as DRFValidationError
from django.contrib.auth.models import update_last_login
from .jwt_cookies import set_refresh_cookie, clear_refresh_cookie, REFRESH_TOKEN_COOKIE_NAME


"""
    In the settings.py, the default permission is IsAuthenticated so we need to override the permission everytime we want different from it.
"""


"""
    Using APIView as it is flexible with modifying request logics.
    Here only post requests are allowed.
    RegisterSerializer is called for validation and creating user.
"""
class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        
        # an obj holding raw input from client
        serializer = RegisterSerializer(data=request.data)
        # is_valid validates data through RegisterSerializer validation logic
        if serializer.is_valid():
            #.save() finally triggers create()
            serializer.save()
            return Response({'message': 'Registration successful! Please check your email to get your login details.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            update_last_login(None, user) # Update the last_login timestamp
            token_data = serializer.get_jwt_token(user)
            token_data["data"]["user"] = {
                "id": str(user.id),
                "email": user.email,
                "username": user.username,
                "role": user.role,
                "theme": user.theme,
            }
            response = Response(token_data, status=status.HTTP_200_OK)
            refresh_token = token_data.get("data", {}).get("token", {}).get("refresh")
            if refresh_token:
                set_refresh_cookie(response, refresh_token)
            return response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)





class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "OTP sent to your email"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "OTP verified successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Password reset successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.must_change_password = False
            user.save()
            return Response({"message": "Password changed successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

class UserProfileDetailView(RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserProfileDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PATCH', 'PUT']:
            return UserProfileSerializer
        return UserProfileDetailSerializer

    def get_permissions(self):
        if self.request.method in ['PATCH', 'PUT']:
            from communities.permissions import IsCommunityManager
            return [IsCommunityManager()]
        return [IsAuthenticated()]

class GlobalSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if not query:
            return Response([])

        # Search for Students
        students = User.objects.filter(
            role='student',
            status='active'
        ).filter(
            Q(username__icontains=query) |
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query)
        )[:10]

        # Search for Communities
        communities = User.objects.filter(
            role='community',
            status='active'
        ).filter(
            Q(community_name__icontains=query) |
            Q(username__icontains=query)
        )[:10]

        results = []
        for s in students:
            results.append({
                'id': s.id,
                'name': f"{s.first_name} {s.last_name}".strip() or s.username,
                'username': s.username,
                'type': 'student',
                'image': s.profile_image.url if s.profile_image else None
            })

        for c in communities:
            results.append({
                'id': c.id,
                'name': c.community_name,
                'username': c.username,
                'type': 'community',
                'image': c.community_logo.url if c.community_logo else None
            })

        return Response(results)


class GoogleAuthView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        id_token = serializer.validated_data.get('id_token')
        access_token = serializer.validated_data.get('access_token')

        try:
            if id_token:
                id_info = GoogleAuthService.verify_google_id_token(id_token)
            else:
                id_info = GoogleAuthService.verify_google_access_token(access_token)
            
            user = GoogleAuthService.get_or_create_user(id_info)

            refresh = RefreshToken.for_user(user)
            update_last_login(None, user) # Update for Google Auth as well
            
            response = Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username,
                    'role': getattr(user, 'role', None),
                    'theme': getattr(user, 'theme', 'light')
                }
            }, status=status.HTTP_200_OK)
            set_refresh_cookie(response, str(refresh))
            return response

        except Exception as e:
            # Handle specific status codes based on the error
            error_msg = str(e)
            if "Email not verified" in error_msg:
                return Response({'error': error_msg}, status=status.HTTP_401_UNAUTHORIZED)
            if "restricted to Herald College" in error_msg:
                return Response({'error': error_msg}, status=status.HTTP_403_FORBIDDEN)
            
            return Response({'error': error_msg}, status=status.HTTP_400_BAD_REQUEST)


class CookieTokenRefreshView(APIView):
    """Issue a new access token from the HttpOnly refresh cookie or request body."""

    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get(REFRESH_TOKEN_COOKIE_NAME) or request.data.get('refresh')
        if not refresh_token:
            return Response(
                {'detail': 'Refresh token is required.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = TokenRefreshSerializer(data={'refresh': refresh_token})
        try:
            serializer.is_valid(raise_exception=True)
        except DRFValidationError as exc:
            return Response(exc.detail, status=status.HTTP_401_UNAUTHORIZED)

        response = Response(serializer.validated_data, status=status.HTTP_200_OK)
        new_refresh = serializer.validated_data.get('refresh')
        if new_refresh:
            set_refresh_cookie(response, new_refresh)
        return response


class LogoutView(APIView):
    """Clear the HttpOnly refresh cookie (client clears access token locally)."""

    permission_classes = [AllowAny]

    def post(self, request):
        response = Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)
        clear_refresh_cookie(response)
        return response


class ContactUsView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ContactUsMessageSerializer(data=request.data)
        if serializer.is_valid():
            contact_message = serializer.save(
                user=request.user if request.user.is_authenticated else None
            )
            return Response(
                {
                    "message": "Thank you for contacting us. We will get back to you soon.",
                    "id": str(contact_message.id)
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserThemePreferenceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"theme": request.user.theme}, status=status.HTTP_200_OK)

    def patch(self, request):
        serializer = ThemePreferenceSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MentionSearchView(APIView):
    """Search users to mention in comments. Returns up to 10 matching active users."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if not query:
            return Response([])

        users = User.objects.filter(
            status='active'
        ).filter(
            Q(username__icontains=query) |
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query)
        ).exclude(id=request.user.id).select_related()[:10]

        results = []
        for user in users:
            if user.role == 'community' and user.community_logo:
                avatar = request.build_absolute_uri(user.community_logo.url)
            elif user.profile_image:
                avatar = request.build_absolute_uri(user.profile_image.url)
            else:
                avatar = None

            full_name = f"{user.first_name} {user.last_name}".strip()
            results.append({
                "id": str(user.id),
                "username": user.username,
                "full_name": full_name or user.username,
                "avatar": avatar,
            })

        return Response(results)
