from .models import User, PasswordResetOTP
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .utils import generate_auto_password, generate_otp
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from rest_framework.serializers import ModelSerializer, ValidationError, Serializer, EmailField, CharField, ChoiceField
from utils.email_utils import send_branded_email
from rest_framework import serializers


class RegisterSerializer(ModelSerializer):
    """
    The serializer here is accepting registration data.
    Validating the data.
    Creating a new User by hashing password and sending password to email.
    """

    class Meta:
        model = User
        # only these fields can be received from the frontend
        fields = ['first_name', 'last_name', 'username', 'email', 'course','interests', 'linkedin_link', 'github_link','bio', 'profile_image']

    # validating if email belongs to herald college or not, validating existance
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise ValidationError("Email already exists")
        
        # endswith returns true if the value ends with passed value
        if not value.lower().endswith('@heraldcollege.edu.np'):
            raise ValidationError("Email must be a Herald College email")
        
        return value


    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise ValidationError("Username already exists")
        return value

    def validate(self, data):
        role = data.get('role', 'student')
        if role == 'student' and not data.get('course'):
            raise ValidationError("Students must select a course")

        return data



    """
    This function runs exactly when serializer.save() is called.
    It creates user with auto pass.
    
    """
    def create(self, validated_data):
        user = User(**validated_data)#creating user instance in mem, obj is still not created, so is not saved to db yet 

        # generating password
        auto_password = generate_auto_password(user.email, user.username)

        user.set_password(auto_password)#hashing the password
        user.save()#creating user obj, user is actually created
        
        
        subject = "Welcome to HCKonnect - Your Account Details"
        branding_context = {
            "name": user.first_name,
            "message": f"Welcome to HCKonnect! <br><br>Your account has been successfully created. Here are your login credentials:<br><br><b>Password:</b> {auto_password}<br><br>Please log in and change your password immediately.",
            "button_text": "Login to HCKonnect",
            "button_url": "http://localhost:5173/login"
            
        }
        send_branded_email(subject, user.email, branding_context)

        return user 


class LoginSerializer(Serializer):
    
    # user inputs
    email = EmailField()
    password = CharField(write_only=True) # will never be exposed in response

    def validate(self, data):
        user = authenticate(username=data['email'], password=data['password']) # returns user object
        if not user:
            raise ValidationError("Invalid credentials")
        data['user'] = user # adding the returned user obj to the validated data
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

class ForgotPasswordSerializer(Serializer):
    email = EmailField() #email of the user requesting password reset
    type = ChoiceField(choices=["send", "resend"],default="send")


    def validate(self, data):
        """
        Checks email existance.
        If exists! store the user obj in validated data
        """
        email = data["email"]
        if not User.objects.filter(email=email).exists():
            raise ValidationError("User with this email does not exist")
        data["user"] = User.objects.get(email=email)
        return data # drf now knows this input is valid

    def save(self):
        user = self.validated_data["user"] # data after validation
        req_type = self.validated_data.get("type", "send") 

        # request limit (max allowed 4)
        one_hour_ago = timezone.now() - timedelta(hours=1)
        otp_count = PasswordResetOTP.objects.filter(user=user,created_at__gte=one_hour_ago,).count()

        if otp_count >= 8:
            raise ValidationError(
                "Too many OTP requests. Please try again later."
            )

        # if the otp is not expired cannot send otp request again till its expired
        active_otp = PasswordResetOTP.objects.filter(user=user,is_verified=False).order_by("-created_at").first()


        if active_otp and not active_otp.is_expired():

            remaining = max(0,120 - int((timezone.now() - active_otp.created_at).total_seconds())
            )
            raise ValidationError(
                f"OTP already sent. Please wait {remaining} seconds."
            )

        # Generate OTP
        otp = generate_otp()

        PasswordResetOTP.objects.create(user=user,otp=otp,otp_type=req_type)

        # send through email
        subject = (
            "Your OTP Has Been Resent"
            if req_type == "resend"
            else "OTP for HCKonnect Password Reset"
        )

        from utils.email_utils import send_branded_email
        
        branding_context = {
            "name": user.first_name,
            "message": f"You have requested to reset your password. Use the OTP below to proceed.<br><br><span style='font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #0d1f14;'>{otp}</span><br><br>This OTP is valid for <b>2 minutes</b>.",
            "button_text": "Verify OTP"
        }
        
        send_branded_email(subject, user.email, branding_context)

        return {"message": "OTP sent successfully"}






class VerifyOTPSerializer(Serializer):
    """
    User submits email and otp
    serializer validates
    marks the otp as verified
    returns user obj
    """
    email = EmailField()
    otp = CharField(max_length=6)

    def validate(self, data):
        email = data['email']
        otp = data['otp']
        try:
            user = User.objects.get(email=email)
            
            #record otp if its valid
            otp_record = PasswordResetOTP.objects.filter(user=user, otp=otp, is_verified=False).last()
            if not otp_record:
                raise ValidationError("Invalid OTP")
            
            if otp_record.is_expired():
                raise ValidationError("OTP expired")
        except User.DoesNotExist:
            raise ValidationError("User does not exist")
        
        #saving the otp obj and user obj in validated data
        data['otp_record'] = otp_record
        data['user'] = user
        return data

    def save(self):
        otp_record = self.validated_data['otp_record']
        otp_record.is_verified = True # finally verifying it
        otp_record.save()
        return self.validated_data['user']


class ResetPasswordSerializer(Serializer):
    email = EmailField()
    new_password = CharField(write_only=True, min_length=8)

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise ValidationError("User does not exist")
        return value

    def validate(self, data):
        user = User.objects.get(email=data['email'])
        # Check if OTP is verified
        if not PasswordResetOTP.objects.filter(user=user, is_verified=True).exists():
            raise ValidationError("OTP not verified")
        data['user'] = user
        return data

    def save(self):
        user = self.validated_data['user']
        user.set_password(self.validated_data['new_password'])
        user.must_change_password = False  
        user.save()
        
        # Clean up OTPs
        PasswordResetOTP.objects.filter(user=user).delete()
        return user

class UserProfileSerializer(ModelSerializer):
    membership = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            "id", "username", "first_name", "last_name", "email", "role", 
            "profile_image", "course", "interests",
            "bio", "linkedin_link", "github_link", "university_id", "membership"
        ]
        read_only_fields = ["id", "email", "role"]

    def get_membership(self, obj):
        if hasattr(obj, 'membership'):
            membership = obj.membership
            return {
                "community_name": membership.community.community_name,
                "community_logo": membership.community.community_logo.url if membership.community.community_logo else None,
                "role": membership.role
            }
        return None

class UserProfileDetailSerializer(ModelSerializer):
    membership = serializers.SerializerMethodField()
    posted_content = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "username", "first_name", "last_name", "role",
            "profile_image", "course", "interests", "bio",
            "linkedin_link", "github_link", "membership", "posted_content"
        ]

    def get_membership(self, obj):
        if hasattr(obj, 'membership'):
            membership = obj.membership
            return {
                "community_name": membership.community.community_name,
                "community_logo": membership.community.community_logo.url if membership.community.community_logo else None,
                "role": membership.role
            }
        return None

    def get_posted_content(self, obj):
        from contents.models import Announcement
        from events.models import Event
        from discussion.models import DiscussionPanel
        
        # We need to return data that matches what cards expect
        content = []
        
        # Discussions
        discussions = DiscussionPanel.objects.filter(created_by=obj).order_by('-created_at')
        for d in discussions:
            content.append({
                "id": str(d.id),
                "type": "discussion",
                "topic": d.topic,
                "content": d.content,
                "created_at": d.created_at,
                "created_by": str(d.created_by.id),
                "created_by_name": d.created_by.username,
                "visibility": d.visibility,
                "reply_count": d.replies.count(),
                "reaction_count": d.reactions.count(),
                "community": {
                    "id": str(d.community.id) if d.community else None,
                    "name": d.community.community_name if d.community else "General"
                } if d.community else None
            })

        # Announcements
        announcements = Announcement.objects.filter(created_by_user=obj).order_by('-created_at')
        for a in announcements:
            content.append({
                "id": str(a.id),
                "type": "announcement",
                "title": a.title,
                "description": a.description,
                "createdAt": a.created_at,
                "visibility": a.visibility,
                "community": {
                    "id": str(a.community.id),
                    "name": a.community.community_name
                },
                "author": {
                    "id": str(a.created_by_user.id),
                    "name": a.created_by_user.username
                }
            })

        # Events
        events = Event.objects.filter(created_by=obj).order_by('-date')
        for e in events:
            content.append({
                "id": str(e.id),
                "type": "event",
                "title": e.title,
                "description": e.description,
                "eventMeta": {
                    "date": e.date,
                    "time": e.start_time,
                    "location": e.location
                },
                "community": {
                    "id": str(e.community.id),
                    "name": e.community.community_name
                },
                "stats": {
                    "registrations": {
                        "current": 0, # Should ideally fetch actual counts
                        "capacity": 100
                    }
                }
            })
            
        return content
