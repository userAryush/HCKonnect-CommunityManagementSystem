from django.db import models
from Base.models import BaseModel
from django.contrib.auth.models import AbstractUser

class User(AbstractUser, BaseModel):

    #user roles
    role_choices = [
        ('student', 'Student'),
        ('community', 'Community'),
        ('admin', 'Admin'),
    ]
    
    # course joined
    course_choices = [
        ('bcs','Bachelor of Computer Science'),
        ('bba','Bachelor of Business Administration'),
        ('bibm','Bachelor in International Business Management'),
        ('cybersecurity','Bachelor in Cyber Security')
    ]
    #interest fields
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
    STATUS_CHOICES = [
    ('active', 'Active'),
    ('blocked', 'Blocked'),
    ('deleted', 'Deleted'),
    ]


    #common fields
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=255, unique=True)
    role = models.CharField(max_length=20, choices=role_choices, default='student')
    status = models.CharField(max_length=20,choices=STATUS_CHOICES,default='active')

    #extra info for students
    profile_image = models.ImageField(upload_to='profile_images/', null=True, blank=True)
    linkedin_link = models.URLField(null=True, blank=True)
    github_link = models.URLField(null=True, blank=True)
    course = models.CharField(max_length=20, choices=course_choices, null=True, blank=True)
    interests = models.JSONField(null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    university_id = models.CharField(max_length=20, null=True, blank=True)

    #community fields
    community_name = models.CharField(max_length=255, null=True, blank=True,unique=True)
    community_description = models.TextField(null=True, blank=True)
    community_logo = models.ImageField(upload_to='community_logos/', null=True, blank=True)
    community_tag = models.CharField(max_length=255, null=True, blank=True)

    must_change_password = models.BooleanField(default=True)
    
    #credentials
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'role']

    def __str__(self):
        return f"{self.username} ({self.role})"


