import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomService } from './room.service';
import { AuthService } from 'src/auth/auth.service';
import { GameService } from 'src/game/game.service';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: process.env.CORS_URL,
    credentials: true,
  },
})
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private roomService: RoomService,
    private authService: AuthService,
    private gameService: GameService,
  ) { }

  async handleConnection(
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const user = await this.authService.wsCheckAuth(client);
      if (!user) {
        client.disconnect();
        return;
      }
      
    } catch (e) {
      client.disconnect();
    }
  }

  async handleDisconnect(
    @ConnectedSocket() client: Socket) {
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody('roomName') roomName: string,
  ) {
    try {
      const user = await this.authService.wsCheckAuth(client);
      if (!user) {
        client.disconnect();
        return;
      }

      await this.roomService.wsJoinRoom(client, roomName);
      client.emit('roomJoined');
    } catch (e) {
      client.disconnect();
    }
  }

  @SubscribeMessage('newMessage')
  async newMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody('msg') msg: string,
    @MessageBody('roomName') roomName: string,
  ) {
    try {
      const user = await this.authService.wsCheckAuth(client);
      if (!user || !roomName || !msg) {
        client.disconnect();
        return;
      }

      const message = await this.roomService.getLastMessageRoom(user, roomName, msg);
      if (!message) {
        return;
      }
      this.server.to(roomName).emit("newMessage", message);

    } catch (e) {
      client.disconnect();
    }
  }

  @SubscribeMessage('join_wait')
  async joinWait(
    @ConnectedSocket() client: Socket,
    @MessageBody() messageId: string,
  ) {
    try {
      const user = await this.authService.wsCheckAuth(client);
      if (!user) {
        client.disconnect();
        return (false);
      }

      const waitingGames = await this.gameService.isUserWaitingGame(user);
      if (waitingGames.length) {
        return (false);
      }
      const inviteGame = await this.gameService.joinWaitGameMess(user, messageId);
      if (!inviteGame) {
        return (false);
      }
      await client.join(inviteGame.id);
      if (await this.gameService.checkWaitGameStart(inviteGame.id)) {
        await this.roomService.deleteMessage(messageId);
        await this.gameService.createInviteCurrentGame(inviteGame.createrId, inviteGame.invitedId);
        this.server.to(inviteGame.id).emit('game_start');
      }
      return (true);
    } catch (e) {
      client.disconnect();
      return (false);
    }

  }

  @SubscribeMessage('cancel_wait')
  async cancelWait(
    @ConnectedSocket() client: Socket,
    @MessageBody() messageId: string,
  ) {
    try {
      const user = await this.authService.wsCheckAuth(client);
      if (!user) {
        client.disconnect();
        return (false);
      }

      const waitingGames = await this.gameService.isUserWaitingGame(user);
      if (!waitingGames.length) {
        return (false);
      }
      const status = await this.gameService.cancelWaitGameMess(user, messageId);
      if (status) {
        await client.leave(status.id);
        return (true);
      }
      return (false);

    } catch (e) {
      client.disconnect();
      return (false);
    }

  }

}
