from django.contrib import auth
from django.shortcuts import render
from django.shortcuts import redirect
from django.http import HttpResponseRedirect
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.forms import AuthenticationForm


def register(response):
    if response.user.is_authenticated:
        return HttpResponseRedirect('/api/pretty_chat/')

    if response.method == 'POST':
        form = UserCreationForm(response.POST)
        if form.is_valid():
            form.save()
            username = form.data.get('username')
            password = form.data.get('password1')
            user = auth.authenticate(username=username, password=password)
            auth.login(response, user)
            return redirect('/api/pretty_chat/')
    else:
        form = UserCreationForm()
    return render(response, 'register/register.html', {'form': form})


def custom_login(request):
    if request.user.is_authenticated:
        return HttpResponseRedirect('/api/pretty_chat/')

    if request.method == 'POST':
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            username = request.POST.get('username')
            password = request.POST.get('password')
            user = auth.authenticate(username=username, password=password)

            if user is not None:
                auth.login(request, user)
                return HttpResponseRedirect('/api/pretty_chat/')
    else:
        form = AuthenticationForm()

    return render(request, 'registration/login.html', {'form': form})


def custom_logout(request):
    auth.logout(request)
    return redirect('login')


def error_404(request, exception):
    data = {}
    return render(request, 'error/404.html', data)
