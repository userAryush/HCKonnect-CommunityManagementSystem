from django.contrib import admin
from .models import User, CommunityUser, PasswordResetOTP, AdminManagement

from django.forms import ModelForm, ValidationError, CharField, PasswordInput
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
        fields = ['community_name', 'community_description', 'community_logo', 'email', 'username','bio']
    
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

from django import forms
from django.contrib import admin
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from django.core.exceptions import ValidationError
from .models import User, AdminManagement  # adjust import

# Creation form
class AdminCreationForm(forms.ModelForm):
    password1 = forms.CharField(label='Password', widget=forms.PasswordInput, required=True)
    password2 = forms.CharField(label='Confirm Password', widget=forms.PasswordInput, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'must_change_password']

    def clean_password2(self):
        p1 = self.cleaned_data.get('password1')
        p2 = self.cleaned_data.get('password2')
        if p1 and p2 and p1 != p2:
            raise ValidationError("Passwords don't match")
        return p2

    def save(self, commit=True):
        user = super().save(commit=False)
        user.role = 'admin'
        user.set_password(self.cleaned_data['password1'])
        if commit:
            user.save()
        return user

# Change form
class AdminChangeForm(forms.ModelForm):
    password = ReadOnlyPasswordHashField(label=("Password"),
        help_text=("Raw passwords are not stored, so there is no way to see this user's password, "
                   "but you can change the password using <a href=\"../password/\">this form</a>."))

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'must_change_password']

    def clean_password(self):
        return self.initial["password"]

# Admin
class AdminManage(admin.ModelAdmin):
    form = AdminChangeForm
    add_form = AdminCreationForm  # <— use this when creating new admin
    list_display = ('username','email')

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.filter(role='admin')

    def get_form(self, request, obj=None, **kwargs):
        """
        Use custom form depending on whether adding or changing.
        """
        if obj is None:
            kwargs['form'] = self.add_form
        else:
            kwargs['form'] = self.form
        return super().get_form(request, obj, **kwargs)

admin.site.register(AdminManagement, AdminManage)
