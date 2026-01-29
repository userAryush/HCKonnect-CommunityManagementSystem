from django.contrib import admin
from .models import User, CommunityUser, PasswordResetOTP, AdminManagement

from django.forms import ModelForm, ValidationError, CharField, PasswordInput
from .utils import generate_community_tag,generate_auto_password
from django.core.mail import send_mail
from django.conf import settings
from django import forms
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from django.core.exceptions import ValidationError

admin.site.register(User)
admin.site.register(PasswordResetOTP)



"""
    Using DjangoForms to create a special interface to create commmunity.
    ModdelForm knows which fields exist, validates input and saves obj.
"""
class CommunityCreationForm(ModelForm):
    class Meta:
        model = User
        fields = ['community_name', 'community_description', 'community_logo', 'email', 'username','bio']

    def clean_email(self):
        email = self.cleaned_data.get('email').lower()
        qs = User.objects.filter(email=email)

        if self.instance.pk:
            qs = qs.exclude(pk=self.instance.pk)

        if qs.exists():
            raise ValidationError("Email already exists")

        if not email.endswith('@heraldcollege.edu.np'):
            raise ValidationError("Email must be a Herald College email.")

        return email


    def save(self, commit=True):
        # Check if this is a new record BEFORE we do anything else
        is_new = self.instance._state.adding 
        
        user = super().save(commit=False)
        user.role = 'community'

        if is_new: 
            user.community_tag = generate_community_tag(user.community_name)
            auto_password = generate_auto_password(user.email, user.username)
            user.set_password(auto_password)
            
            # We attach it to the form instance so the Admin can see it later
            self._auto_password = auto_password
            print(f"Generated Password: {self._auto_password}") # Debugging

        if commit:
            user.save()

        return user







class CommunityAdmin(admin.ModelAdmin):
    form = CommunityCreationForm

    list_display = ('community_name', 'email', 'username')
    search_fields = ('community_name',)

    def get_queryset(self, request):
        return super().get_queryset(request).filter(role='community')

    def get_form(self, request, obj=None, **kwargs):
        """
        Force CommunityCreationForm for ADD and CHANGE
        """
        defaults = kwargs
        defaults['form'] = CommunityCreationForm
        return super().get_form(request, obj, **defaults)

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)

        auto_password = getattr(form, '_auto_password', None)
        print("AUTO:", auto_password)

        if not change and auto_password:
            send_mail(
                subject="Your HCKonnect Community Account Password",
                message=(
                    f"Hello {obj.community_name},\n\n"
                    f"Your community account has been created.\n"
                    f"Your password is: {auto_password}\n"
                    "Please change it after first login."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[obj.email],
                fail_silently=False,
            )

            
# telling django admin to use CommunityAdmin to manage the CommunityUser
admin.site.register(CommunityUser, CommunityAdmin)



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
