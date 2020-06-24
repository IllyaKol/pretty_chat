# pretty_chat

> This chat connecting people! You can mention some users(@user1 wich split by spaces) and they will receive a notification with style italic(only for mentioned user).  When the new user logged in other users will receive an "info" message like: "user1 connected"


## Install requirements
```
pip install -r requirements.txt
```

## DB Setup
```
CREATE DATABASE pretty_chat;
CREATE ROLE django_auth WITH LOGIN PASSWORD 'asdfgh';
GRANT ALL PRIVILEGES ON DATABASE pretty_chat TO django_auth;
```

## First run server
```
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## Django Settings

> PSQL DATABASES: set host, name database and user with password.
> REDIS DATABASES: set REDIS_HOST, REDIS_PORT and REDIS_DB where running redis-server
