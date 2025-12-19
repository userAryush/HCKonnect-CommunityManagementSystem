from django.db import models
from django.conf import settings
from Base.models import BaseModel


class CommunityMembership(BaseModel):
    ROLE_CHOICES = [("member", "Member"), ("moderator", "Moderator")]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,limit_choices_to={"role": "student"}, related_name="memberships")

    community = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,limit_choices_to={"role": "community"}, related_name="members")

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="member")

    class Meta:
        unique_together = ("user", "community")

    def __str__(self):
        return f"{self.user.username} → {self.community.community_name}"
    
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user"], name="unique_student_membership")
        ]


