import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {

  @Prop()
  senderId: string;

  @Prop()
  receiverId: string;

  @Prop()
  groupId: string;

  @Prop()
  message: string;

  @Prop({
    default: 'sent',
  })
  status: string;

  @Prop({
    default: false,
  })
  isRead: boolean;
}

export const MessageSchema =
  SchemaFactory.createForClass(Message);