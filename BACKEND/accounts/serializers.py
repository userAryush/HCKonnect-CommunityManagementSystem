from rest_framework import serializers
from .models import User, PasswordResetOTP
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
from django.conf import settings
from .utils import generate_auto_password, generate_otp
from django.contrib.auth import get_user_model



class RegisterSerializer(serializers.ModelSerializer):


    class Meta:
        model = User
        fields = ['username', 'email', 'role', 'course','interests', 'linkedin_link', 'github_link','bio', 'profile_image']

    # validating if email belongs to herald college or not, validating existance
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        
        # endswith returns true if the value ends with passed value
        if not value.lower().endswith('@heraldcollege.edu.np'):
            raise serializers.ValidationError("Email must be a Herald College email")
        
        return value


    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value

    def validate(self, data):
        return data



    
    # Create user with automatic password
    def create(self, validated_data):
        user = User(**validated_data)#creating user instance , obj is still not created 


        auto_password = generate_auto_password(user.email, user.username)

        user.set_password(auto_password)#hashing the password
        user.save()#creating user obj

        # Send password via email
        subject = "Your Herald College Account Password"
        message = f"Hello {user.username},\n\nYour account has been created.\nYour password is: {auto_password}\nPlease change it after first login."
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [user.email]
        send_mail(subject, message, from_email, recipient_list, fail_silently=False)

        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        data['user'] = user
        return data

    def get_jwt_token(self, user):
        refresh = RefreshToken.for_user(user)
        return {
            'msg': 'Login successful',
            'data': {
                'token': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token)
                }
            }
        }




User = get_user_model()

class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    type = serializers.CharField(default="send")  # send / resend

    def validate(self, data):
        email = data["email"]
        if not User.objects.filter(email=email).exists():
            raise serializers.ValidationError("User with this email does not exist")
        data["user"] = User.objects.get(email=email)
        return data

    def save(self):
        user = self.validated_data["user"]
        req_type = self.validated_data["type"]

        # DELETE old OTP if resend
        if req_type == "resend":
            PasswordResetOTP.objects.filter(user=user, is_verified=False).delete()

            subject = "Your OTP Code Has Been Resent"
            email_msg = "You requested a new OTP. "
            response_msg = {"message": "OTP resent successfully"}
        else:
            subject = "Password Reset OTP"
            email_msg = ""
            response_msg = {"message": "OTP sent successfully"}


        # Generate new OTP
        otp = generate_otp()
        PasswordResetOTP.objects.create(user=user, otp=otp)

        # Send email
        message = (
            f"Hi {user.username},\n\n"
            f"{email_msg}Your OTP is: {otp}\n"
            f"It is valid for 3 minutes.\n\n"
            f"If you did not request this, please ignore this email."
        )

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email]
        )

        return response_msg



class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)

    def validate(self, data):
        email = data['email']
        otp = data['otp']
        try:
            user = User.objects.get(email=email)
            otp_record = PasswordResetOTP.objects.filter(user=user, otp=otp, is_verified=False).last()
            if not otp_record:
                raise serializers.ValidationError("Invalid OTP")
            if otp_record.is_expired():
                raise serializers.ValidationError("OTP expired")
        except User.DoesNotExist:
            raise serializers.ValidationError("User does not exist")
        data['otp_record'] = otp_record
        data['user'] = user
        return data

    def save(self):
        otp_record = self.validated_data['otp_record']
        otp_record.is_verified = True
        otp_record.save()
        return self.validated_data['user']


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User does not exist")
        return value

    def validate(self, data):
        user = User.objects.get(email=data['email'])
        # Check if OTP verified
        if not PasswordResetOTP.objects.filter(user=user, is_verified=True).exists():
            raise serializers.ValidationError("OTP not verified")
        data['user'] = user
        return data

    def save(self):
        user = self.validated_data['user']
        user.set_password(self.validated_data['new_password'])
        user.must_change_password = False  # optional
        user.save()
        # Clean up OTPs
        PasswordResetOTP.objects.filter(user=user).delete()
        return user
