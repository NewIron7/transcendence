import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { DirectService } from './direct.service';
import { AuthService } from 'src/auth/auth.service';
import { Server, Socket } from 'socket.io';
import { GameService } from 'src/game/game.service';

@WebSocketGateway({
  namespace: 'priv',
  cors: {
    origin: process.env.CORS_URL,
    credentials: true,
  },
})
export class DirectGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private directService: DirectService,
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

  @SubscribeMessage('join')
  async join(
    @ConnectedSocket() client: Socket,
    @MessageBody('friendName') friendName: string,
  ) {
    try {
      const user = await this.authService.wsCheckAuth(client);
      if (!user) {
        client.disconnect();
        return;
      }

      await this.directService.wsJoinFriend(client, user, friendName);
    } catch (e) {
      client.disconnect();
    }

  }

  @SubscribeMessage('newMessage')
  async newMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody('msg') msg: string,
    @MessageBody('friendName') friendName: string,
  ) {
    try {
      const user = await this.authService.wsCheckAuth(client);
      if (!user || !friendName || !msg) {
        client.disconnect();
        return;
      }

      const message = await this.directService.getLastMessage(user, friendName, msg);
      if (!message) {
        return;
      }
      this.server.to(user.username + friendName).emit("newMessage", message);
      
    } catch (e) {
      client.disconnect();
    }
  }

  @SubscribeMessage('join_wait')
  async joinWait(
    @ConnectedSocket() client: Socket,
    @MessageBody() directMessageId: string,
  ) {
    try {
      const user = await this.authService.wsCheckAuth(client);
      if (!user) {
        client.disconnect();
        return;
      }

      const waitingGames = await this.gameService.isUserWaitingGame(user);
      if (waitingGames.length) {
        return (false);
      }
      const inviteGame = await this.gameService.joinWaitGameDirect(user, directMessageId);
      if (!inviteGame) {
        return (false);
      }
      await client.join(inviteGame.id);
      if (await this.gameService.checkWaitGameStart(inviteGame.id)) {
        await this.directService.deleteDirectMessage(directMessageId);
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
    @MessageBody() directMessageId: string,
  ) {
    try {
      const user = await this.authService.wsCheckAuth(client);
      if (!user) {
        client.disconnect();
        return;
      }

      const waitingGames = await this.gameService.isUserWaitingGame(user);
      if (!waitingGames.length) {
        return (false);
      }
      const status = await this.gameService.cancelWaitGameDirect(user, directMessageId);
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
