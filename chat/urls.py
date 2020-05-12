from django.urls import path

from . import views

app_name = 'chat'

urlpatterns = [
    path('dialog/', views.Dialog.as_view()),
    path('users/', views.Users.as_view()),
    path('pretty_chat/', views.pretty_room, name='pretty_room'),
]
