import { Module } from '@nestjs/common';
import { DirectGateway } from './direct.gateway';
import { DirectController } from './direct.controller';
import { DirectService } from './direct.service';
import { AuthModule } from 'src/auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { GameService } from 'src/game/game.service';

@Module({
  imports: [AuthModule],
  providers: [DirectGateway,
    DirectService,
    PrismaService,
    JwtService,
    UserService,
    GameService,
  ],
  controllers: [DirectController]
})
export class DirectModule {}
