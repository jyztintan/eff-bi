# Generated by Django 4.2.16 on 2024-10-09 21:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('effbi_api', '0014_tile_component'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tile',
            name='dash_id',
            field=models.IntegerField(default=0),
        ),
    ]