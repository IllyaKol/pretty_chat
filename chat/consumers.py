import json

from channels.generic.websocket import AsyncWebsocketConsumer

from .utils import get_all_users
from .utils import get_recipients
from .utils import save_online_user
from .utils import get_online_users
from .utils import delete_online_user


class PrettyChatConsumer(AsyncWebsocketConsumer):
    async def connect(self) -> None:
        self.user = self.scope['user']
        self.groups.append(self.user.username)
        self.group_name = 'chat_pretty_chat'

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

        await save_online_user(self.user.username)

        await self.receive(
            text_data=json.dumps({
                'event': 'Send',
                'type': 'information',
                'message': 'connected',
                'nickname': self.user.username
            })
        )

    async def disconnect(self, code) -> None:
        await delete_online_user(self.user.username)

        await self.receive(
            text_data=json.dumps({
                'event': 'Send',
                'type': 'information',
                'message': 'disconnected',
                'nickname': self.user.username
            })
        )

        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive(self, text_data=None, bytes_data=None) -> None:
        data = json.loads(text_data)
        message = data['message']
        nickname = data['nickname']

        online_users = await get_online_users()
        all_users = await get_all_users()
        all_users = sorted(all_users)


        recipients = await get_recipients(message)

        if 'type' not in data:
            data_type = 'message'
        else:
            data_type = data['type']

        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'chat_message',
                'data_type': data_type,
                'message': message,
                'nickname': nickname,
                'recipients': recipients,
                'all_users': all_users,
                'online_users': online_users
            }
        )

    async def chat_message(self, event) -> None:
        message = event['message']
        nickname = event['nickname']
        data_type = event['data_type']
        recipients = event['recipients']
        all_users = event['all_users']
        online_users = event['online_users']

        await self.send(
            text_data=json.dumps({
                'event': 'Send',
                'type': data_type,
                'message': message,
                'nickname': nickname,
                'recipients': recipients,
                'all_users': all_users,
                'online_users': online_users
            })
        )
