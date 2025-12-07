from rest_framework import serializers
from .models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
import re
import random
import string
from django.core.mail import send_mail
from django.conf import settings



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

        # Generate automatic password
        # Example: first 4 chars of email + username + random 4-digit number
        email_prefix = validated_data['email'].split('@')[0][:4]
        username = validated_data['username']
        random_number = ''.join(random.choices(string.digits, k=4))
        auto_password = f"{email_prefix}{username}{random_number}"

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
