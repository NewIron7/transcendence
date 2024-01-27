import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from './user.service';
import { AuthService } from 'src/auth/auth.service';

@WebSocketGateway({
  namespace: 'status',
  cors: {
    origin: process.env.CORS_URL,
    credentials: true,
  },
})
export class UserGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) { }

  async handleConnection(
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const user = await this.authService.wsCheckAuth(client);
      if (!user) {
        client.disconnect();
        return ;
      }
      await this.userService.setUserOnline(user);
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
        return ;
      }
      await this.userService.setUserOffline(user);
    } catch (e) {
      client.disconnect();
    }
  }

  
}
