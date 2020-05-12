from channels.db import database_sync_to_async
from django.contrib.auth.models import User


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


def get_users():
    users = [user.username for user in User.objects.all()]
    return users
