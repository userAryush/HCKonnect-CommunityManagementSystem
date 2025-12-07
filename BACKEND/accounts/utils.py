import re

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

    # Step 1: Get first 2 words
    words = raw.split()
    first_two = " ".join(words[:2])

    # Step 3: Remove special characters
    clean = re.sub(r'[^a-z0-9]', '', first_two)

    return f"{clean}_member"
