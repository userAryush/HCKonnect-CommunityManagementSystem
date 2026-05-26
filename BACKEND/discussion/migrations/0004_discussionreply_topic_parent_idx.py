# Composite index on (topic_id, parent_reply_id) for fast top-level reply lookups:
# filter(topic_id=x, parent_reply__isnull=True)

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('discussion', '0003_discussionreply_mentioned_users'),
    ]

    operations = [
        migrations.AddIndex(
            model_name='discussionreply',
            index=models.Index(
                fields=['topic', 'parent_reply'],
                name='discussion_reply_topic_parent_idx',
            ),
        ),
    ]