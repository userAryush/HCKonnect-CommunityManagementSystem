from rest_framework import serializers
from .models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
import re

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'role', 'course',
            'interests', 'linkedin_link', 'github_link',
            'bio', 'profile_image'
        ]

    # validating if email belongs to herald college or not, validating existance
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        
        # endswith returns true if the value ends with passed value
        if not value.lower().endswith('@heraldcollege.edu.np'):
            raise serializers.ValidationError("Email must be a Herald College email")
        
            # Extract part before '@'
        local_part = value.lower().split('@')[0]

        # Allow only letters, numbers, dot, underscore
        if not re.match(r'^[A-Za-z0-9._]+$', local_part):
            raise serializers.ValidationError(
                "Email cannot contain special characters except . and _"
            )
        return value


    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value

    def validate(self, data):
        if data['password'] == data['username']:
            raise serializers.ValidationError("Password cannot be the same as username")
        return data

    def create(self, validated_data):
        password = validated_data.pop('password') #removing password from the dictionary cz cant store raw pass
        user = User(**validated_data) #creating user instance , obj is still not created 
        user.set_password(password) #hashing the password
        user.save() #creating user obj
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
                },
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'role': user.role,
                    'course': user.course,
                    'interests': user.interests,
                    'linkedin_link': user.linkedin_link,
                    'github_link': user.github_link,
                    'bio': user.bio,
                    'profile_image': user.profile_image.url if user.profile_image else None
                }
            }
        }
