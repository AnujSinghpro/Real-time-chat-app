import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway
  implements
  OnGatewayConnection,
  OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  users = new Map();
  constructor(private readonly chatService: ChatService) { }

  handleConnection(client: Socket) {

    console.log(
      `Connected ${client.id}`,
    );
  }

  handleDisconnect(client: Socket) {

    console.log(
      `Disconnected ${client.id}`,
    );
  }

  // JOIN USER
  /* Expected Data:{ "userId": "6a080ded98..."} */
  @SubscribeMessage('join')
  handleJoin(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {

    console.log('JOIN DATA:', data);
    this.users.set(
      data.userId,
      client.id,
    );

    client.join(data.userId);

    this.server.emit(
      'online-users',
      [...this.users.keys()],
    );
  }

  // ONE TO ONE MESSAGE
  /* Expected Data:{ "senderId": "6a080ded98...", "receiverId":"6a080ded98...", "message":"hello"} */
  @SubscribeMessage('send-message')
  async sendMessage(
    @MessageBody() data: any,
  ) {

    console.log("recever_id", data.receiverId);

    const message =
      await this.chatService
        .savePrivateMessage(data);

    this.server
      .to(data.receiverId)
      .emit(
        'receive-message',
        message,
      );
  }

  // CREATE GROUP 
  /* Expected Data: { groupId: 'group1', groupName: 'Developers', members: ['user1', 'user2', 'user3'] } */
  @SubscribeMessage('create-group')
  async createGroup(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,) {
    console.log('CREATE GROUP:', data,);
    // OPTIONAL DATABASE SAVE //
    await this.chatService.createGroup(data);
    // JOIN ALL MEMBERS TO ROOM 
    data.members.forEach(async (userId: string) => {
      const socketId = this.users.get(userId);
      if (socketId) {
        const memberSocket = this.server.sockets.sockets.get(socketId,);
        if (memberSocket) {
          await memberSocket.join(data.groupId,);

        }
      }
    },
    );
    this.server.emit('group-created', { groupId: data.groupId, groupName: data.groupName, members: data.members, },);
    console.log(`Group Created: ${data.groupId}`,);
  }


  // GROUP MESSAGE
  /* Expected Data:{ "senderId": "6a080ded98...", "groupId":"group1", "message":"hello"} */
  @SubscribeMessage('group-message')
  async groupMessage(
    @MessageBody() data: any,
  ) {


    const message =
      await this.chatService
        .saveGroupMessage(data);

    this.server
      .to(data.groupId)
      .emit(
        'receive-group-message',
        message,
      );
  }




  // JOIN GROUP
  @SubscribeMessage('join-group')
  joinGroup(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {

    client.join(data.groupId);
  }





  // TYPING
  /* Expected Data:{ "receiverId": "6a080ded98..."} */
  @SubscribeMessage('typing')
  typing(
    @MessageBody() data: any,
  ) {

    this.server
      .to(data.receiverId)
      .emit(
        'typing',
        data,
      );
  }




  // READ RECEIPT
  /* Expected Data:{ "messageId": "6a080ded98..." , "senderId": "6a080ded98..."} */
  @SubscribeMessage('read-message')
  async readMessage(
    @MessageBody() data: any,
  ) {

    await this.chatService
      .markAsRead(data.messageId);

    this.server
      .to(data.senderId)
      .emit(
        'message-read',
        data,
      );
  }
}