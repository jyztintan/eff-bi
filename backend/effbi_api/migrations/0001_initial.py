# Generated by Django 4.2.16 on 2024-10-05 07:21

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Organization',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('database_uri', models.CharField(max_length=255)),
            ],
            options={
                'db_table': 'organizations',
                'managed': True,
            },
        ),
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('first_name', models.CharField(max_length=100)),
                ('last_name', models.CharField(max_length=100)),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('organization', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='effbi_api.organization')),
            ],
            options={
                'db_table': 'users',
                'managed': True,
            },
        ),
        migrations.CreateModel(
            name='OrgTables',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('table_name', models.CharField(max_length=100)),
                ('table_schema', models.TextField()),
                ('column_descriptions', models.JSONField()),
                ('column_types', models.JSONField()),
                ('organization', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='effbi_api.organization')),
            ],
            options={
                'db_table': 'organization_tables',
                'managed': True,
            },
        ),
    ]
