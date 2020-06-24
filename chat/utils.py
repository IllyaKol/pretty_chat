from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from django.core.cache import cache


async def get_recipients(message):
    recipients = []
    if '@' in message:
        users = await database_sync_to_async(get_users)()
        splitted_message = message.split(' ')

        for splt_msg in splitted_message:
            if splt_msg.startswith('@') and splt_msg[1:] in users:
                splt_msg = splt_msg[1:]
                if splt_msg not in recipients:
                    recipients.append(splt_msg)

    return list(set(recipients))


async def save_online_user(user) -> None:
    if cache.get('online_users') is None:
        cache.set('online_users', [user])
    else:
        online_users = cache.get('online_users')
        if user not in online_users:
            online_users.append(user)
        cache.delete('online_users')
        cache.set('online_users', online_users)
    return


async def delete_online_user(user) -> None:
    online_users = cache.get('online_users')

    if user in online_users:
        online_users.remove(user)

    cache.delete('online_users')
    cache.set('online_users', online_users)
    return


async def get_online_users() -> list:
    online_users = cache.get('online_users')
    return online_users


async def get_all_users():
    users = await database_sync_to_async(get_users)()
    return users


def get_users():
    users = [user.username for user in User.objects.all()]
    return users
