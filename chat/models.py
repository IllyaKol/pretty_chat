from django.db import models
from django.contrib.auth.models import User


class Chat(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.CharField(max_length=64)
    date = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Messages"
