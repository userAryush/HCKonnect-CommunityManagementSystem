from django.db import models
from Base.models import BaseModel
from django.contrib.auth.models import AbstractUser
# Create your models here.

class User(AbstractUser, BaseModel):

    role_choices =[
            ('student', 'Student'),
            ('community_admin', 'Community'),
            ('admin', 'Admin'),
        ]
    
    course_choices =[
        ('bcs','Bachelor of Computer Science'),
        ('bba','Bachelor of Business Administration'),
        ('bibm','Bachelor in International Business Management'),
        ('cybersecurity','Bachelor in Cyber Security')
    ]
    interest_choices = [
    ('ai', 'Artificial Intelligence'),
    ('webdev', 'Web Development'),
    ('mobiledev', 'Mobile App Development'),
    ('devops', 'DevOps'),
    ('software_engineering', 'Software Engineering'),
    ('uiux', 'UI/UX Designing'),

    ('cyber', 'Cyber Security'),
    ('network_security', 'Network Security'),
    ('ethical_hacking', 'Ethical Hacking'),

    ('marketing', 'Digital Marketing'),
    ('finance', 'Finance & Investment'),
    ('entrepreneurship', 'Entrepreneurship'),
    ('project_management', 'Project Management'),
    ('business_analytics', 'Business Analytics'),

    ('leadership', 'Leadership Skills'),
    ('research', 'Academic Research'),
    ('public_speaking', 'Public Speaking'),
    ('community_engagement', 'Community Engagement'),
]

    
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=255, unique=True)
    profile_image = models.ImageField(upload_to='profile_images/', null=True, blank=True)
    
    #
    role = models.CharField(max_length=20,choices=role_choices,default='student')

    linkedin_link = models.URLField(null=True, blank=True)
    github_link = models.URLField(null=True, blank=True)
    course = models.CharField(
        max_length=20,
        choices=course_choices
    )
    interests = models.JSONField(null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    
    community = models.ForeignKey('Community',on_delete=models.SET_NULL,null=True,blank=True,related_name='members')
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'role']

    def __str__(self):
        return f"{self.username} ({self.role})"
    
class Community(BaseModel):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(null=True, blank=True)
    logo = models.ImageField(upload_to='community_logos/', null=True, blank=True)

    # The community admin user (created only by main Admin)
    user = models.OneToOneField('User',on_delete=models.CASCADE,
        related_name='community_admin_account',null=True,blank=True
    )

    def __str__(self):
        return self.name
