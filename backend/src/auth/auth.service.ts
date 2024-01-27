import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { toDataURL } from 'qrcode';
import { authenticator } from 'otplib';
import { Socket } from 'socket.io';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private httpService: HttpService,
    private config: ConfigService,
    private userService: UserService,
  ) { }

  async generateJWT(user: any): Promise<string> {
    const payload = { fyId: user.fyId, username: user.username };
    return await this.jwtService.signAsync(payload);
  }

  async exchangeCodeForAccessToken(code: string): Promise<any> {
    try {
      const response = await lastValueFrom(this.httpService.post('https://api.intra.42.fr/oauth/token', {
        grant_type: 'authorization_code',
        client_id: this.config.get('FORTYTWO_CLIENT_ID'),
        client_secret: this.config.get('FORTYTWO_CLIENT_SECRET'),
        code: code,
        redirect_uri: this.config.get('FORTYTWO_REDIRECT_URI'),
      }));

      return response.data;
    } catch (error) {
      throw new Error('Failed to exchange code for access token');
    }
  }

  async fetchUserData(accessToken: string): Promise<any> {
    try {
      const response = await lastValueFrom(this.httpService.get('https://api.intra.42.fr/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      }));

      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch user data');
    }
  }

  async validateUserPayload(payload: any): Promise<any> {
    const { fyId, username } = payload;

    // Fetch the user from your database or user service
    if (username) {
      const user = await this.userService.findUserByUsername(username);
      if (!user) {
        return null;
      }

      return user;
    }
    return null;
  }

  async generateQrCodeData(otpAuthUrl: string) {
    return toDataURL(otpAuthUrl);
  }

  async turnOn2fa(username: string): Promise<any> {
    const user = await this.userService.findUserByUsername(username);
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.username, process.env.APP_NAME, secret);
    const qrcode = this.generateQrCodeData(otpauthUrl);

    const encryptSecret = this.userService.encrypt(secret);

    await this.userService.turnOn2fa(username, encryptSecret);

    return qrcode;
  }

  async is2faCodeValid(code: string, username: string): Promise<boolean> {
    const secret = await this.userService.get2faSecret(username);

    const decryptSecret = this.userService.decrypt(secret);

    return authenticator.verify({
      token: code,
      secret: decryptSecret,
    });
  }

  async check2faState(username: string, state: string): Promise<boolean> {
    const realState = await this.userService.get2FaState(username, state);
    if (!realState || state != realState)
      return false;
    return true;
  }

  extractTokenFromCookie(cookies: string): string | null {
    let token = cookies.split('; ').find((row) => row.startsWith('jwt='));
    if (token) {
      token = token.split('=')[1];
      return token;
    }
    return null;
  }

  async wsCheckAuth(client: Socket): Promise<User> {
    const cookies = client?.handshake?.headers?.cookie;
    if (!cookies) {
      client.disconnect();
      return null;
    }

    const token = this.extractTokenFromCookie(cookies);
    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        {
          secret: process.env.JWT_SECRET,
        }
      );

      const user = await this.validateUserPayload(payload);
      return user;
    } catch {
      client.disconnect();
      return null;
    }
  }
}
