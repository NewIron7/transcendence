import { Module } from '@nestjs/common';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RoomGateway } from './room.gateway';
import { UserService } from 'src/user/user.service';
import { GameService } from 'src/game/game.service';

@Module({
  imports: [AuthModule],
  controllers: [RoomController],
  providers: [
    RoomService,
    PrismaService,
    JwtService,
    RoomGateway,
    UserService,
    GameService,
  ]
})
export class RoomModule {}
