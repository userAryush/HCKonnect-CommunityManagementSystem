from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer, LoginSerializer, ForgotPasswordSerializer, VerifyOTPSerializer, ResetPasswordSerializer, UserProfileSerializer, UserProfileDetailSerializer, GlobalSearchSerializer
from django.db.models import Q
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.generics import RetrieveUpdateAPIView, RetrieveAPIView
from .models import User


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
            token_data = serializer.get_jwt_token(user)
            return Response(token_data, status=status.HTTP_200_OK)
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

class UserProfileView(RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

class UserProfileDetailView(RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserProfileDetailSerializer
    permission_classes = [IsAuthenticated]

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
