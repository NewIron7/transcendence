import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { GameService } from './game.service';
import { IUpdatePaddle } from './utils/IGameElems';

@WebSocketGateway({
  namespace: 'game',
  cors: {
    origin: process.env.CORS_URL,
    credentials: true,
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private userService: UserService,
    private gameService: GameService,
    private authService: AuthService,
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

      await this.userService.setUserPlaying(user);
      const currentGame = await this.gameService.findCurrentGame(user);
      if (currentGame) {
        client.emit('in_game');
      }
    } catch (e) {
      client.disconnect();
    }

  }

  async handleDisconnect(
    @ConnectedSocket() client: Socket
  ) {
    try {
      const user = await this.authService.wsCheckAuth(client);
      if (!user) {
        client.disconnect();
        return;
      }

      await this.userService.setUserOnline(user);
    } catch (e) {
    }
  }

  @SubscribeMessage('join_game')
  async handleJoinGame(
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const user = await this.authService.wsCheckAuth(client);
      if (!user) {
        client.disconnect();
        return undefined;
      }

      const currentGame = await this.gameService.joinFreeGame(user);
      const clientRooms = Array.from(client.rooms);
      if (!clientRooms.includes(currentGame.id)) {
        await client.join(currentGame.id);
      }
      if (currentGame.createrId && currentGame.invitedId) {
        if (!this.gameService.activeGames[currentGame.id]) {
          this.gameService.startGame(this.server, currentGame);
        }
        const isCreater = user.id === currentGame.createrId ? true : false;
        client.emit('pos', isCreater);
        client.broadcast.to(currentGame.id).emit('pos', !isCreater);
        this.server.to(currentGame.id).emit('start_game', currentGame);
      }
      return currentGame;
    } catch (e) {
      return undefined;
    }
  }

  @SubscribeMessage('leave_game')
  async handleLeaveGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { currentGameId: string },
  ) {
    try {
      const user = await this.authService.wsCheckAuth(client);
      const currentGameId = data.currentGameId;
      if (user && currentGameId) {
        const leftGame = await this.gameService.leaveCurrentGame(user);
        if (!leftGame) {
          return;
        }
        //stop the game loop for this game
        if (this.gameService.activeGames[leftGame.id]) {
          clearInterval(this.gameService.activeGames[leftGame.id].intervalId as NodeJS.Timeout);
          delete this.gameService.activeGames[leftGame.id];
        }
        client.broadcast.to(leftGame.id).emit('opponent_left');
        this.server.in(leftGame.id).socketsLeave(leftGame.id);
      } else {
        client.disconnect();
        return ;
      }
    } catch (e) {
    }
  }

  @SubscribeMessage('paddle_update')
  async handlePaddleUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { newUpdatePaddle: IUpdatePaddle, currentGameId: string }
  ) {
    try {
      const { newUpdatePaddle, currentGameId } = data;

      const user = await this.authService.wsCheckAuth(client);
      if (!user) {
        client.disconnect();
        return ;  
      }

      this.gameService.updatePaddlePos(currentGameId, newUpdatePaddle);
      return;
    } catch (e) {
    }
  }
}
