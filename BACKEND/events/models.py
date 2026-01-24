from django.db import models
from Base.models import BaseModel
from django.conf import settings

# Create your models here.
class Event(BaseModel):
    community = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name="events",limit_choices_to={"role": "community"},)
    title = models.CharField(max_length=255)
    description = models.TextField()
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()

    location = models.CharField(max_length=255, null=True, blank=True)
    
    FORMAT_CHOICES = [
        ("On-site", "On-site"),
        ("Online", "Online"),
        ("Hybrid", "Hybrid"),
    ]
    format = models.CharField(max_length=20, choices=FORMAT_CHOICES, default="On-site")
    
    image = models.ImageField(upload_to="events/", null=True, blank=True)
    
    speakers = models.JSONField(null=True,blank=True,help_text='Example: [{"name": "Aryush Khatri", "profession": "Backend Engineer"}]')

    what_to_expect = models.JSONField(null=True,blank=True,help_text='Example: ["Hands-on workshop", "Networking session", "Live demo"]')

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,null=True,blank=True,related_name="created_events",)
    
    class Meta:
        ordering = ["date", "start_time"]

    def __str__(self):
        return f"{self.title} ({self.date})"