from rest_framework import serializers
from django.contrib.auth.models import User

from .models import Chat


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username")


class ChatSerializers(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Chat
        fields = ("user", "text", "date")


class ChatPostSerializers(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = ("text",)
