from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer, LoginSerializer, ForgotPasswordSerializer, VerifyOTPSerializer, ResetPasswordSerializer, UserProfileSerializer, UserProfileDetailSerializer
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
