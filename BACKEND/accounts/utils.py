import re
import random, string

def generate_community_tag(community_name):
    """
    Generate a clean tag based on community name:
    - take first 2 words
    - lowercase
    - replace '&' with 'and'
    - remove all non-alphanumeric chars
    - append '_member'
    """
    if not community_name:
        return ""

    raw = community_name.strip().lower()

    # Get first 2 words
    words = raw.split()
    first_two = " ".join(words[:2])

    # Remove special characters
    clean = re.sub(r'[^a-z0-9]', '', first_two)

    return f"{clean}_member"


def generate_auto_password(email, username):
    email_prefix = email.split('@')[0][:4]
    random_number = ''.join(random.choices(string.digits, k=4))
    return f"{email_prefix}{username}{random_number}"



def generate_otp(length=6):
    """Generate a numeric OTP"""
    return ''.join([str(random.randint(0, 9)) for _ in range(length)])
