from django.db import models
from django.conf import settings
from Base.models import BaseModel
from django.core.exceptions import ValidationError


User = settings.AUTH_USER_MODEL

# for hashtags
class DiscussionPanel(BaseModel):
    VISIBILITY_CHOICES = [
        ("public", "Public"),
        ("private", "Private"),
    ] # private meaning only within the community

    topic = models.CharField(max_length=255)
    content = models.TextField(null=True, blank=True)

    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="discussions")
    community = models.ForeignKey(
        User,  
        on_delete=models.CASCADE,null=True,blank=True,related_name="community_discussions", limit_choices_to={'role':'community'})

    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default="public")


    is_pinned = models.BooleanField(default=False)
    class Meta:
        ordering = ["-created_at"]



    def __str__(self):
        return self.topic
    


class DiscussionReply(BaseModel):
    topic = models.ForeignKey(DiscussionPanel, on_delete=models.CASCADE, related_name="replies")

    parent_reply = models.ForeignKey("self",null=True,blank=True,on_delete=models.CASCADE,related_name="children")

    reply_content = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    
    def __str__(self):
        return f"Reply by {self.created_by} on {self.topic.topic}"


class Reaction(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    topic = models.ForeignKey(DiscussionPanel, null=True, blank=True, on_delete=models.CASCADE, related_name="reactions")
    reply = models.ForeignKey(DiscussionReply, null=True, blank=True, on_delete=models.CASCADE, related_name="reactions")
    reaction_type = models.CharField(max_length=10, default="like")

    class Meta:
        unique_together = ("user", "topic", "reply")

        
    

    def clean(self):
        if not self.topic and not self.reply:
            raise ValidationError("Reaction must belong to a topic or reply.")
        if self.topic and self.reply:
            raise ValidationError("Reaction cannot belong to both.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
        
    def __str__(self):
        if self.topic:
            return f"{self.user} reacted {self.reaction_type} on topic {self.topic}"
        if self.reply:
            return f"{self.user} reacted {self.reaction_type} on reply {self.reply.id}"

