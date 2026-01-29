from django.db import models
from django.conf import settings
from Base.models import BaseModel


class CommunityMembership(BaseModel):
    MEMBER_ROLE = [("member", "Member"), ("representative", "Community Representative")]
    
    # Changed to OneToOneField to enforce single-community membership
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, limit_choices_to={"role": "student"}, 
    related_name="membership" # Singular name makes more sense now
    )
    # Community remains a ForeignKey because one community has many members
    community = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, limit_choices_to={"role": "community"}, related_name="members")
    role = models.CharField(max_length=20, choices=MEMBER_ROLE, default="member")
    
    class Meta:
        verbose_name = "Community Membership"

    def __str__(self):
        return f"{self.user.username} ({self.role})"
        
class CommunityVacancy(BaseModel):
    community = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,limit_choices_to={"role": "community"})

    title = models.CharField(max_length=255)
    description = models.TextField()

    role = models.CharField(max_length=20,choices=[("member", "Member")],default="member")
    deadline = models.DateTimeField(null=True, blank=True)

    is_open = models.BooleanField(default=True)


    def __str__(self):
        return f"{self.title} - {self.community.community_name}"

class VacancyApplication(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,limit_choices_to={"role": "student"},related_name="vacancy_applications")
    vacancy = models.ForeignKey("CommunityVacancy",on_delete=models.CASCADE,related_name="applications")
    resume = models.FileField(upload_to="applications/", null=True, blank=True)  
    message = models.TextField(blank=True)  # cover letter
    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "vacancy")

    def __str__(self):
        return f"{self.user.username} → {self.vacancy.title}"

        
class Announcement(BaseModel):
    title = models.CharField(max_length=255)
    description = models.TextField()
    image = models.ImageField(upload_to="announcements/", null=True, blank=True)
    VISIBILITY_CHOICES = [
        ("public", "Public"),
        ("private", "Private")
    ]
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default="public")

    # Community posting (community user)
    community = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name="community_announcements",limit_choices_to={"role": "community"})

    # Nullable: student(representative) posting on behalf of community
    created_by_user = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,null=True,blank=True,related_name="user_announcements",limit_choices_to={"role": "student"})

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title






