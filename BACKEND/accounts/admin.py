from django.contrib import admin
from .models import User, CommunityUser, PasswordResetOTP

from django import forms
from .utils import generate_community_tag
# Register your models here.

admin.site.register(User)
admin.site.register(PasswordResetOTP)

# models.py



class CommunityCreationForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['community_name', 'community_description', 'community_logo', 'email', 'username']
        
    def validate_email(self):
        email = self.cleaned_data.get('email').lower()

        if not email.endswith('@heraldcollege.edu.np'):
            raise forms.ValidationError("Email must be a Herald College email.")


        return email

    def save(self, commit=True):
        user = super().save(commit=False)
        user.role = 'community'  # automatically set role
        # Create the tag only for community accounts
        user.community_tag = generate_community_tag(user.community_name)

        if commit:
            user.save()
        return user
    
class CommunityAdmin(admin.ModelAdmin):
    form = CommunityCreationForm
    list_display = ('community_name', 'email', 'username')
    search_fields = ('community_name', 'email', 'username')

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.filter(role='community')
    # show only community accounts

admin.site.register(CommunityUser, CommunityAdmin)