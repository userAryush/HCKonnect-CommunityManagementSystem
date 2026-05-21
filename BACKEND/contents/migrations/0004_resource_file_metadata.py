# Generated manually — resource file size + raw Cloudinary storage

import cloudinary_storage.storage
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("contents", "0003_resource"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name="resource",
            name="file_size_bytes",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name="resource",
            name="original_filename",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
        migrations.AlterField(
            model_name="resource",
            name="file",
            field=models.FileField(
                blank=True,
                null=True,
                storage=cloudinary_storage.storage.RawMediaCloudinaryStorage(),
                upload_to="resources/",
            ),
        ),
    ]
