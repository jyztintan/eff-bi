# Generated by Django 4.2.16 on 2024-10-08 05:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('effbi_api', '0003_merge_20241008_0507'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='created_at',
        ),
        migrations.RemoveField(
            model_name='user',
            name='updated_at',
        ),
        migrations.AlterField(
            model_name='user',
            name='id',
            field=models.CharField(max_length=100, primary_key=True, serialize=False),
        ),
    ]
