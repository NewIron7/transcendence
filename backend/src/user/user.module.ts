import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from 'src/auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { UserGateway } from './user.gateway';

@Module({
  imports: [AuthModule],
  providers: [UserService, PrismaService, JwtService, UserGateway],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
