from django.db import models


class News(models.Model):
    title = models.CharField(max_length=200)
    description = models.CharField(max_length=500)
    url = models.URLField()
    date = models.DateField()
    news_com = models.CharField(max_length=10)
    similarity = models.FloatField()
    keyword = models.TextField()

    def getDate(self):
        return self.date.strftime("%Y-%m-%d")

    def __str__(self):
        return self.title


class Press(models.Model):
    title = models.CharField(max_length=200)
    date = models.DateField()
    preview_url = models.URLField()
    page_url = models.URLField()
    keyword = models.TextField()

    def getDate(self):
        return self.date.strftime("%Y-%m-%d")

    def __str__(self):
        return self.title


class InputURL(models.Model):
    url = models.URLField()

    def __str__(self):
        return "INPUT"

