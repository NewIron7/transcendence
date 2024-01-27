import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { GameService } from './game.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { GameGateway } from './game.gateway';
import { GameController } from './game.controller';
import { UserService } from 'src/user/user.service';

@Module({
    imports: [AuthModule],
    providers: [GameService, PrismaService, JwtService, GameGateway, UserService],
    controllers: [GameController],
})
export class GameModule {}
