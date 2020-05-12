from django.conf.urls import url

from . import consumers


websocket_urlpatterns = [
    url(r'^ws/api/chat/pretty_chat/$', consumers.PrettyChatConsumer),
]
