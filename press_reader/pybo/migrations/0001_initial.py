# Generated by Django 4.1.3 on 2022-12-09 01:48

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='InputURL',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('url', models.URLField()),
            ],
        ),
        migrations.CreateModel(
            name='News',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('description', models.CharField(max_length=500)),
                ('url', models.URLField()),
                ('date', models.DateField()),
                ('news_com', models.CharField(max_length=10)),
                ('similarity', models.FloatField()),
                ('keyword', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='Press',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('date', models.DateField()),
                ('preview_url', models.URLField()),
                ('page_url', models.URLField()),
                ('keyword', models.TextField()),
            ],
        ),
    ]
