import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

import { MongooseModule } from '@nestjs/mongoose';

import { MessageSchema, Message } from './schema/message.schema';
import { GroupSchema, Group } from './schema/group.schema';

@Module({
  
  imports: [
    MongooseModule.forFeature([
      {
        name: Message.name,
        schema: MessageSchema,
      },

      {
        name: Group.name,
        schema: GroupSchema,
      },
    ]),
  ],

  providers: [ChatGateway, ChatService]
})
export class ChatModule {}
