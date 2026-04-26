from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0006_contactusmessage'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='theme',
            field=models.CharField(
                choices=[('light', 'Light'), ('dark', 'Dark')],
                default='light',
                max_length=10
            ),
        ),
    ]
