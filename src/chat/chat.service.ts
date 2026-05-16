import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './schema/message.schema';

@Injectable()
export class ChatService {

  constructor(
    @InjectModel(Message.name)
    private messageModel: Model<Message>,
  ) {}

  // SAVE PRIVATE MESSAGE
  async savePrivateMessage(data: any) {

    return await this.messageModel.create({
      senderId: data.senderId,
      receiverId: data.receiverId,
      message: data.message,
      status: 'sent',
    });
  }

  // SAVE GROUP MESSAGE
  async saveGroupMessage(data: any) {

    return await this.messageModel.create({
      senderId: data.senderId,
      groupId: data.groupId,
      message: data.message,
      status: 'sent',
    });
  }

  // READ MESSAGE
  async markAsRead(messageId: string) {

    return await this.messageModel.findByIdAndUpdate(
      messageId,
      {
        isRead: true,
        status: 'read',
      },
      {
        new: true,
      },
    );
  }
}