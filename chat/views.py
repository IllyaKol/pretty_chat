from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required

from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Chat
from .serializers import ChatSerializers
from .serializers import ChatPostSerializers


@login_required()
def pretty_room(request):
    return render(request, 'chat/pretty_chat.html', {'nickname': request.user.username})


class Dialog(APIView):
    permission_classes = [permissions.IsAuthenticated, ]

    def get(self, request):
        chat = Chat.objects.all().order_by('date')
        serializer = ChatSerializers(chat, many=True)
        return Response({"data": serializer.data})

    def post(self, request):
        dialog = ChatPostSerializers(data=request.data)
        if dialog.is_valid():
            dialog.save(user=request.user)
            return Response(status=201)
        else:
            return Response(status=400)


class Users(APIView):
    permission_classes = [permissions.IsAuthenticated, ]

    def get(self, request):
        users = [{'key': user.username, 'value': user.username} for user in User.objects.all() if user != request.user]
        return Response({"data": users})
