import { Controller, Get, Req, Res, Post, Query, Body, HttpException, HttpStatus, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
    private userService: UserService,
  ) { }

  @Get('login')
  async login(@Res() res: Response) {
    res.redirect(this.config.get('FORTYTWO_LOGIN_URL'));
  }

  @Get('logout')
  @UseGuards(AuthGuard)
  async logout(@Res() res: Response) {
    res.cookie('jwt', '', { path: '/', httpOnly: false });
    res.redirect(this.config.get('HOME_URL'));
  }


  @Get('isLogged')
  @UseGuards(AuthGuard)
  isLogged() {
    return (true);
  }

  @Get('42')
  redirectTo42Auth(@Res() res: Response) {
    const authorizationUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${this.config.get('FORTYTWO_CLIENT_ID')}&redirect_uri=${encodeURIComponent(this.config.get('FORTYTWO_REDIRECT_URI'))}&response_type=code&scope=public&state=${this.generateRandomState()}`;
    res.redirect(authorizationUrl);
  }

  private generateRandomState() {
    const characters: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomString: string = "";
    for (let i = 0; i < 25; i++) {
      const randomIndex: number = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }
    return randomString;
  }

  @Get('2fa')
  @UseGuards(AuthGuard)
  async is2fa(@Req() req: any) {
    const user = await this.userService.findUserByUsername(req.user.username);
    return user.twofactor;
  }

  @Get('turn-on-2fa')
  @UseGuards(AuthGuard)
  async turnOn2fa(@Req() req: any) {
    return await this.authService.turnOn2fa(req.user.username);
  }

  @Get('turn-off-2fa')
  @UseGuards(AuthGuard)
  async turnOff2fa(@Req() req: any) {
    await this.userService.turnOff2fa(req.user.username);
  }

  @Post('code')
  async check2faCode(
    @Query('username') username: string,
    @Query('state') state: string,
    @Body('code') code: string,
    @Res() res: Response,
  ) {
    if (!username || !state) {
      throw new HttpException('Invalid request', HttpStatus.BAD_REQUEST);
    }

    const check = await this.authService.check2faState(username, state);
    if (check === false)
      throw new UnauthorizedException();

    const valid = await this.authService.is2faCodeValid(code, username);
    if (valid === false)
      throw new UnauthorizedException("Wrong 2FA code");

    const user = await this.userService.findUserByUsername(username);
    try {
      const jwtToken = await this.authService.generateJWT(user);

      res.cookie('jwt', jwtToken, {
        httpOnly: true,
        path: '/',
        // secure: true, // for HTTPS
      });
      res.send();
    } catch (error) {
      throw new UnauthorizedException();
    }

  }

  // @Get('fakeUser')
  // async connectFakeUser(@Query('login') login: string, @Res() res: Response) {
  //   if (!login) {
  //     throw new HttpException('Invalid request', HttpStatus.BAD_REQUEST);
  //   }
  //   try {
  //     let user = await this.userService.findUserByLogin(login);
  //     let finalUrl = this.config.get('HOME_URL');
  //     if (!user) {
  //       user = await this.userService.createUser({
  //         id: Math.floor(100000 + Math.random() * 900000),
  //         login: login,
  //         image: {link:process.env.NEXT_PUBLIC_BACKEND_AVATARS + "default.png"},
  //         email: login + "@fake.fr",
  //       });
  //       finalUrl = this.config.get('USERNAME_URL');
  //     }
  //     else {
  //       if (user.twofactor) {
  //         const baseUrl = this.config.get<string>('FRONT_2FA_CODE_URL');
  //         const state = this.generateRandomState();
  //         const fullUrl = `${baseUrl}?state=${state}&username=${user.username}`;
  //         await this.userService.add2FaState(user.username, state);
  //         res.redirect(fullUrl);
  //         res.send();
  //         return;
  //       }
  //     }
  //     // Create a user session or JWT token here
  //     const jwtToken = await this.authService.generateJWT(user);

  //     res.cookie('jwt', jwtToken, {
  //       httpOnly: true,
  //       path: '/',
  //       // secure: true, // for HTTPS
  //     });
  //     res.redirect(finalUrl);
  //     res.send();
  //   } catch (error) {
  //     throw new UnauthorizedException();
  //   }
  // }

  @Get('42/callback')
  async handle42Callback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
    if (!code || !state) {
      throw new HttpException('Invalid request', HttpStatus.BAD_REQUEST);
    }

    try {
      const tokenData = await this.authService.exchangeCodeForAccessToken(code);
      const { access_token } = tokenData;

      const userData = await this.authService.fetchUserData(access_token);
      let user = await this.userService.findUserByFyId(userData.id);
      let finalUrl = this.config.get('HOME_URL');
      if (!user) {
        user = await this.userService.createUser(userData);
        finalUrl = this.config.get('USERNAME_URL');
      }
      else {
        if (user.twofactor) {
          const baseUrl = this.config.get<string>('FRONT_2FA_CODE_URL');
          const state = this.generateRandomState();
          const fullUrl = `${baseUrl}?state=${state}&username=${user.username}`;
          await this.userService.add2FaState(user.username, state);
          res.redirect(fullUrl);
          res.send();
          return;
        }
      }

      const jwtToken = await this.authService.generateJWT(user);

      res.cookie('jwt', jwtToken, {
        httpOnly: true,
        path: '/',
        // secure: true, // for HTTPS
      });
      res.redirect(finalUrl);
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
