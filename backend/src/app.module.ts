import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { PrismaService } from './prisma/prisma.service';
import { RoomModule } from './room/room.module';
import { DirectModule } from './direct/direct.module';
import { GameModule } from './game/game.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    RoomModule,
    DirectModule,
    GameModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
