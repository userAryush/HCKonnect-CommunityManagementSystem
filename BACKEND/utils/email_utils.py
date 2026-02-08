from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings

def send_branded_email(subject, to_email, context):
    """
    Sends a branded HTML email using the HCKonnect template.
    
    Args:
        subject (str): Email subject.
        to_email (str or list): Recipient email or list of emails.
        context (dict): Dictionary containing template variables:
                        - user_name: Name of the user (optional)
                        - message: The main body text (HTML safe)
                        - button_text: Text for the CTA button (optional)
                        - button_url: URL for the CTA button (optional)
    """
    
    # Ensure to_email is a list
    if isinstance(to_email, str):
        to_email = [to_email]

    html_content = render_to_string('emails/branded_email.html', context)
    text_content = strip_tags(html_content)  # Fallback for plain text clients

    email = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=to_email
    )
    email.attach_alternative(html_content, "text/html")
    
    try:
        email.send()
        print(f"Email '{subject}' sent successfully to {to_email}")
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False
