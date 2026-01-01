from django.contrib import admin
from .models import User, CommunityUser, PasswordResetOTP

from django.forms import ModelForm, ValidationError
from .utils import generate_community_tag
# Register your models here.

admin.site.register(User)
admin.site.register(PasswordResetOTP)



"""
    Using DjangoForms to create a special interface to create commmunity.
    ModdelForm knows which fields exist, validates input and saves obj.
"""
class CommunityCreationForm(ModelForm):
    # in this meta we define this form is based on User model, but only use these fields.
    class Meta:
        model = User
        fields = ['community_name', 'community_description', 'community_logo', 'email', 'username']
    
    #email validation check
    def validate_email(self):
        email = self.cleaned_data.get('email').lower()

        if not email.endswith('@heraldcollege.edu.np'):
            raise ValidationError("Email must be a Herald College email.")


        return email

    def save(self, commit=True):
        user = super().save(commit=False) # creating user object
        user.role = 'community'  # automatically set role
        # Create the tag only for community accounts
        user.community_tag = generate_community_tag(user.community_name)

        if commit: # default is True
            user.save()
        return user


class CommunityAdmin(admin.ModelAdmin):
    """
        Special dashboard for just communities.
        Its a custom admin panel configuration which only shows user with role community. using proxy model with same model User.
    """
    form = CommunityCreationForm # tells to use custom form for creation and edits
    
    list_display = ('community_name', 'email', 'username')
    search_fields = ('community_name',)

    def get_queryset(self, request):
        """
            determines what data the admin sees.
            gets all the user obj through proxy model and filters

        """
        qs = super().get_queryset(request)#queryset of all user obj, so its a queryset obj now
        return qs.filter(role='community') # restricts to only community users.
    
# telling django admin to use CommunityAdmin to manage the CommunityUser
admin.site.register(CommunityUser, CommunityAdmin)