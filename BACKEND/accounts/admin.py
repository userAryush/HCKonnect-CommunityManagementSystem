from django.contrib import admin
from .models import User, CommunityUser, PasswordResetOTP, AdminManagement, ContactUsMessage

from django.forms import ModelForm, ValidationError, CharField, PasswordInput
from .utils import generate_community_tag,generate_auto_password
from django.core.mail import send_mail
from django.conf import settings
from django import forms
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from django.core.exceptions import ValidationError
from utils.email_utils import send_branded_email

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'status', 'is_staff')
    list_filter = ('role', 'status', 'is_staff', 'is_superuser')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'community_name')
    ordering = ('role', 'username')


@admin.register(PasswordResetOTP)
class PasswordResetOTPAdmin(admin.ModelAdmin):
    list_display = ('user', 'otp', 'otp_type', 'is_verified', 'created_at')
    list_filter = ('otp_type', 'is_verified')
    search_fields = ('user__email', 'user__username', 'otp')
    raw_id_fields = ('user',)
    ordering = ('-created_at',)


@admin.register(ContactUsMessage)
class ContactUsMessageAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'subject', 'is_resolved', 'user', 'created_at')
    list_filter = ('is_resolved', 'created_at')
    search_fields = ('full_name', 'email', 'subject', 'message')
    raw_id_fields = ('user',)
    ordering = ('-created_at',)



"""
    Using DjangoForms to create a special interface to create commmunity.
    ModdelForm knows which fields exist, validates input and saves obj.
"""
class CommunityCreationForm(ModelForm):
    class Meta:
        model = User
        fields = [
            'community_name', 'community_description', 'community_logo', 'email',
            'username', 'bio', 'is_platform_community',
        ]

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

    def clean_is_platform_community(self):
        from communities.platform import validate_single_platform_community
        is_platform = self.cleaned_data.get('is_platform_community', False)
        if is_platform:
            user = self.instance or User()
            user.is_platform_community = True
            user.role = 'community'
            validate_single_platform_community(user)
        return is_platform

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

    list_display = ('community_name', 'email', 'username', 'is_platform_community')
    list_filter = ('is_platform_community',)
    search_fields = ('community_name',)

    def get_queryset(self, request):
        return super().get_queryset(request).filter(role='community')

    def get_form(self, request, user=None, **kwargs):
        """
        Force CommunityCreationForm for ADD and CHANGE
        """
        defaults = kwargs
        defaults['form'] = CommunityCreationForm
        return super().get_form(request, user, **defaults)

    def save_model(self, request, user, form, change):
        super().save_model(request, user, form, change)

        auto_password = getattr(form, '_auto_password', None)


        if not change and auto_password:
            subject = "Your HCKonnect Community Account Password"
            branding_context = {
                "name": user.community_name,
                "message": (
                    f"Welcome to HCKonnect! <br><br>Your community account has been successfully created. "
                    f"Here are your login credentials:<br><br><b>Password:</b> {auto_password}<br><br>"
                    "Please log in and change your password immediately."
                ),
                "button_text": "Login to HCKonnect",
                "button_url": "http://localhost:5173/login",
            }
            send_branded_email(subject, user.email, branding_context)
          

            
# telling django admin to use CommunityAdmin to manage the CommunityUser
admin.site.register(CommunityUser, CommunityAdmin)



class AdminCreationForm(forms.ModelForm):
    """
    Create an HCKonnect admin (role=admin). Password fields set the login secret once;
    Django stores only a hash — the plain password is never saved in the database.
    """

    password1 = forms.CharField(
        label='Password',
        widget=forms.PasswordInput(attrs={'autocomplete': 'new-password'}),
        help_text='Used for /admin and app login (email + this password).',
    )
    password2 = forms.CharField(
        label='Confirm password',
        widget=forms.PasswordInput(attrs={'autocomplete': 'new-password'}),
    )

    class Meta:
        model = User
        fields = (
            'first_name',
            'last_name',
            'username',
            'email',
            'must_change_password',
            'is_active',
            'is_staff',
            'is_superuser',
            'groups',
            'user_permissions',
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['is_active'].initial = True
        self.fields['is_staff'].initial = True
        self.fields['is_superuser'].initial = True
        self.fields[
            'is_staff'
        ].help_text = 'Required to sign in to Django admin (/admin).'
        self.fields[
            'is_superuser'
        ].help_text = 'Full access in Django admin (bypasses object-level checks).'
        self.fields['groups'].help_text = (
            'Optional. Assign Django auth groups for permission bundles.'
        )
        self.fields['user_permissions'].help_text = (
            'Optional. Fine-grained permissions in addition to groups.'
        )

    def clean_password2(self):
        p1 = self.cleaned_data.get('password1')
        p2 = self.cleaned_data.get('password2')
        if p1 and p2 and p1 != p2:
            raise ValidationError("Passwords don't match.")
        return p2

    def save(self, commit=True):
        user = super().save(commit=False)
        user.role = 'admin'
        user.set_password(self.cleaned_data['password1'])
        if commit:
            user.save()
            self.save_m2m()
        return user


class AdminChangeForm(forms.ModelForm):
    """
    Edit an existing admin. Password field shows the stored hash (not readable).
    Use the separate “change password” admin page to set a new login password.
    """

    password = ReadOnlyPasswordHashField(
        label='Password',
        help_text=(
            'Stored as a secure hash — you cannot read the original password here. '
            'To set a new login password, use '
            '<a href="../password/">this change-password form</a>.'
        ),
    )

    class Meta:
        model = User
        fields = (
            'first_name',
            'last_name',
            'username',
            'email',
            'password',
            'must_change_password',
            'is_active',
            'is_staff',
            'is_superuser',
            'groups',
            'user_permissions',
        )

    def clean_password(self):
        return self.initial.get('password')

    def save(self, commit=True):
        user = super().save(commit=False)
        user.role = 'admin'
        if commit:
            user.save()
            self.save_m2m()
        return user


@admin.register(AdminManagement)
class AdminManage(admin.ModelAdmin):
    form = AdminChangeForm
    add_form = AdminCreationForm
    filter_horizontal = ('groups', 'user_permissions')

    list_display = (
        'first_name',
        'last_name',
        'username',
        'email',
        'is_staff',
        'is_superuser',
        'is_active',
        'must_change_password',
    )
    ordering = ('first_name', 'last_name')

    fieldsets = (
        (
            'Profile',
            {'fields': ('first_name', 'last_name', 'username', 'email')},
        ),
        (
            'Password',
            {
                'fields': ('password',),
                'description': (
                    'Login uses <strong>email</strong> (not username) on the HCKonnect app, '
                    'and <strong>username or email</strong> on Django admin — plus the password '
                    'you set at creation (or after a password change).'
                ),
            },
        ),
        (
            'Permissions & access',
            {
                'fields': (
                    'must_change_password',
                    'is_active',
                    'is_staff',
                    'is_superuser',
                    'groups',
                    'user_permissions',
                ),
            },
        ),
    )

    add_fieldsets = (
        (
            'Profile',
            {'fields': ('first_name', 'last_name', 'username', 'email')},
        ),
        (
            'Password',
            {
                'fields': ('password1', 'password2'),
                'description': (
                    'Choose the password this person will use to log in. '
                    'It is hashed before storage; only they should know the plain text.'
                ),
            },
        ),
        (
            'Permissions & access',
            {
                'fields': (
                    'must_change_password',
                    'is_active',
                    'is_staff',
                    'is_superuser',
                    'groups',
                    'user_permissions',
                ),
            },
        ),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).filter(role='admin')

    def get_fieldsets(self, request, obj=None):
        if obj is None:
            return self.add_fieldsets
        return self.fieldsets

    def get_form(self, request, obj=None, **kwargs):
        if obj is None:
            kwargs['form'] = self.add_form
        else:
            kwargs['form'] = self.form
        return super().get_form(request, obj, **kwargs)

    def save_model(self, request, obj, form, change):
        """Form.save() already sets role, password (on create), and M2M — only enforce role here."""
        obj.role = 'admin'
        super().save_model(request, obj, form, change)
