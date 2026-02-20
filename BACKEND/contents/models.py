from django.db import models
from django.conf import settings
from Base.models import BaseModel
from django.core.exceptions import ValidationError

# Create your models here.
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
    
User = settings.AUTH_USER_MODEL

class Post(BaseModel):

    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    content = models.TextField()
    # Adding an optional image field to make it more like Facebook
    image = models.ImageField(upload_to="posts/", null=True, blank=True)
    
    # Logic: This only affects the author's own profile view
    is_pinned = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Post by {self.author} at {self.created_at}"


class PostComment(BaseModel):

    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    parent_comment = models.ForeignKey(
        "self", 
        null=True, 
        blank=True, 
        on_delete=models.CASCADE, 
        related_name="replies"
    )
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"Comment by {self.author} on Post {self.post.id}"


class PostReaction(BaseModel):

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, null=True, blank=True, on_delete=models.CASCADE, related_name="reactions")
    comment = models.ForeignKey(PostComment, null=True, blank=True, on_delete=models.CASCADE, related_name="reactions")
    reaction_type = models.CharField(max_length=20, default="like") # e.g., 'like', 'love', 'haha'

    class Meta:
        # Ensures a user can only react once per specific post or comment
        unique_together = ("user", "post", "comment")

    def clean(self):
        if not self.post and not self.comment:
            raise ValidationError("Reaction must belong to a post or a comment.")
        if self.post and self.comment:
            raise ValidationError("Reaction cannot belong to both simultaneously.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        target = self.post if self.post else f"Comment {self.comment.id}"
        return f"{self.user} reacted {self.reaction_type} on {target}"