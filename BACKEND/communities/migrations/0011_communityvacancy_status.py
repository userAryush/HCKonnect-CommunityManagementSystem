from django.db import migrations, models


def sync_vacancy_status(apps, schema_editor):
    CommunityVacancy = apps.get_model("communities", "CommunityVacancy")
    CommunityVacancy.objects.filter(is_open=True).update(status="OPEN")
    CommunityVacancy.objects.filter(is_open=False).update(status="CLOSED")


class Migration(migrations.Migration):

    dependencies = [
        ("communities", "0010_delete_announcement"),
    ]

    operations = [
        migrations.AddField(
            model_name="communityvacancy",
            name="status",
            field=models.CharField(
                choices=[("OPEN", "Open"), ("CLOSED", "Closed")],
                default="OPEN",
                max_length=10,
            ),
        ),
        migrations.RunPython(sync_vacancy_status, migrations.RunPython.noop),
    ]
