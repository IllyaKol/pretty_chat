import json

from channels.generic.websocket import AsyncWebsocketConsumer

from .utils import get_recipients


class PrettyChatConsumer(AsyncWebsocketConsumer):
    async def connect(self) -> None:
        self.user = self.scope['user']
        self.group_name = 'chat_pretty_chat'

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

        await self.receive(
            text_data=json.dumps({
                'event': 'Send',
                'type': 'information',
                'message': 'connected',
                'nickname': self.user.username
            })
        )

    async def disconnect(self, code) -> None:
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
                'recipients': recipients
            }
        )

    async def chat_message(self, event) -> None:
        message = event['message']
        nickname = event['nickname']
        data_type = event['data_type']
        recipients = event['recipients']

        await self.send(
            text_data=json.dumps({
                'event': 'Send',
                'type': data_type,
                'message': message,
                'nickname': nickname,
                'recipients': recipients
            })
        )
