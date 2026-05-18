from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0007_user_theme'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='is_platform_community',
            field=models.BooleanField(
                default=False,
                help_text='Official platform organization (e.g. Herald DevCorps). Only one allowed system-wide.',
            ),
        ),
    ]
