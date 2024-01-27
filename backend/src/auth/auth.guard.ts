import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        {
          secret: process.env.JWT_SECRET,
        }
      );
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = await this.validate(payload);
    } catch {
      throw new UnauthorizedException('Wrong token');
    }
    // Here, you can also add additional validation if needed
    return true; // or false to deny access
  }

  private extractTokenFromHeader(request: Request): string | null {
    let data = request?.headers.cookie;
    if (data) {
      let token = data.split('; ').find((row) => row.startsWith('jwt='));
      if (token) {
        token = token.split('=')[1];
        return token;
      }
    } else {
      return null;
    }
  }

  private async validate(payload: any) {
    // You can add more validation logic here
    const user = await this.authService.validateUserPayload(payload);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
