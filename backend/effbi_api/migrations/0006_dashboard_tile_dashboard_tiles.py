# Generated by Django 4.2.16 on 2024-10-08 22:10

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('effbi_api', '0005_remove_organization_created_at_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Dashboard',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField()),
                ('organization', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='effbi_api.organization')),
            ],
            options={
                'db_table': 'dashboards',
                'managed': True,
            },
        ),
        migrations.CreateModel(
            name='Tile',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField()),
                ('sql_query', models.TextField()),
                ('dashboard_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='effbi_api.dashboard')),
            ],
            options={
                'db_table': 'tiles',
                'managed': True,
            },
        ),
        migrations.AddField(
            model_name='dashboard',
            name='tiles',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='effbi_api.tile'),
        ),
    ]