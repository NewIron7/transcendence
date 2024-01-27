import { Body, Controller, ForbiddenException, Get, Param, Post, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { Express } from 'express';
import * as fs from 'fs';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
  ) { }

  @Get('game_history')
  @UseGuards(AuthGuard)
  async getGameHistory(
    @Req() req: any,
  ) {
    return await this.userService.getGameHistory(req.user);
  }

  @Get('leaderboard')
  @UseGuards(AuthGuard)
  async getLeaderboard(
    @Req() req: any,
  ){
    return await this.userService.getLeaderboard();
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getMe(@Req() req: any) {
    return await this.userService.getUser(req.user);
  }

  @Get('isMe')
  @UseGuards(AuthGuard)
  getIsMe(
    @Query('username') username: string,
    @Req() req: any
  ) {
    return (req.user.username === username);
  }

  @Get('other/:username')
  @UseGuards(AuthGuard)
  async getUser(@Param() params: any) {
    return await this.userService.getUserOther(params.username);
  }

  @Post('username')
  @UseGuards(AuthGuard)
  async updateUsername(@Body('newUsername') newUsername: string, @Req() req: any) {
    return await this.userService.updateUsername(req.user.username, newUsername);
  }

  @Post('email')
  @UseGuards(AuthGuard)
  async updateEmail(@Body('newEmail') newEmail: string, @Req() req: any) {
    return await this.userService.updateEmail(req.user.username, newEmail);
  }

  @Get('friends')
  @UseGuards(AuthGuard)
  async getFriends(@Req() req: any) {
    return await this.userService.getFriends(req.user);
  }

  @Get('block')
  @UseGuards(AuthGuard)
  async getAllBlockedUsernames(
    @Req() req: any,
  ) {
    return await this.userService.getAllBlockedUsernames(req.user);
  }

  @Get('block/:username')
  @UseGuards(AuthGuard)
  async isBlocked(
    @Param('username') username: string,
    @Req() req: any,
  ) {
    return await this.userService.isBlockUsername(req.user, username);
  }

  @Post('block')
  @UseGuards(AuthGuard)
  async blockUser(
    @Body('username') toBlockUsername: string,
    @Req() req: any,
  ) {
    if (toBlockUsername === req.user.username) {
      throw new ForbiddenException(`You cannot block yourself`);
    }
    return this.userService.blockUser(req.user, toBlockUsername);
  }

  @Post('unblock')
  @UseGuards(AuthGuard)
  async unblockUser(
    @Body('username') toBlockUsername: string,
    @Req() req: any,
  ) {
    if (toBlockUsername === req.user.username) {
      throw new ForbiddenException(`You cannot unblock yourself`);
    }
    return this.userService.unblockUser(req.user, toBlockUsername);
  }

  @Get('friends-request')
  @UseGuards(AuthGuard)
  async getFriendRequest(@Req() req: any,) {
    return await this.userService.getFriendRequest(req.user);
  }

  @Get('friends-request/:username')
  @UseGuards(AuthGuard)
  async getFriendRequestUser(
    @Param('username') rUsername: string,
    @Req() req: any,
  ) {
    return await this.userService.getFriendRequestUser(
      req.user.username,
      rUsername);
  }

  @Post('friends-request')
  @UseGuards(AuthGuard)
  async createFriendRequest(
    @Body('friendUsername') friendUsername: string,
    @Req() req: any,
  ) {
    if (friendUsername === req.user.username) {
      throw new ForbiddenException(`You cannot send a friend request to yourself`);
    }
    return await this.userService.createFriendRequest(req.user, friendUsername);
  }

  @Post('friends-request-cancel/:username')
  @UseGuards(AuthGuard)
  async cancelFriendRequest(
    @Param('username') rUsername: string,
    @Req() req: any,
  ) {
    if (rUsername === req.user.username) {
      throw new ForbiddenException(`You cannot cancel a friend request to yourself`);
    }
    return await this.userService.cancelFriendRequest(req.user, rUsername);
  }

  @Post('friends-request-delete/:username')
  @UseGuards(AuthGuard)
  async deleteFriendRequest(
    @Param('username') rUsername: string,
    @Req() req: any,
  ) {
    if (rUsername === req.user.username) {
      throw new ForbiddenException(`You cannot delete a friend request to yourself`);
    }
    return await this.userService.deleteFriendRequest(req.user, rUsername);
  }

  @Post('friends-request-decline/:username')
  @UseGuards(AuthGuard)
  async declineFriendRequest(
    @Param('username') rUsername: string,
    @Req() req: any,
  ) {
    if (rUsername === req.user.username) {
      throw new ForbiddenException(`You cannot decline a friend request to yourself`);
    }
    return await this.userService.declineFriendRequest(req.user, rUsername);
  }

  @Post('friends-request-accept/:username')
  @UseGuards(AuthGuard)
  async acceptFriendRequest(
    @Param('username') rUsername: string,
    @Req() req: any,
  ) {
    if (rUsername === req.user.username) {
      throw new ForbiddenException(`You cannot accept a friend request to yourself`);
    }
    return await this.userService.acceptFriendRequest(req.user, rUsername);
  }

  static customFileName(@Req() req, file, cb) {
    if (file.originalname.length > 100) {
      return cb(
        new ForbiddenException(
          'File Name Should Contain Only Letters, Numbers, Underscore, Dash and Dot',
        ),
        false,
      );
    }
    let fileExtension = '';
    if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
      fileExtension = file.mimetype.split('/')[1];
    } else {
      return cb(
        new ForbiddenException(
          'Supported types : [jpg, jpeg, png]!',
        ),
        false,
      );
    }
    const originalName = file.originalname.split('.')[0];
    cb(null, req.user['login'] + '.' + fileExtension);
  }

  static destinationPath(req, file, cb) {
    if (!fs.existsSync(process.env.UTILS_PATH_AVATARS)) {
      fs.mkdirSync(process.env.UTILS_PATH_AVATARS);
    }
    if (
      fs.existsSync(
        process.env.UTILS_PATH_AVATARS + req.user['login'] + '.' + file.mimetype.split('/')[1],
      )
    ) {
      fs.unlink(
        process.env.UTILS_PATH_AVATARS + req.user['login'] + '.' + file.mimetype.split('/')[1],
        (err) => {
          if (err) {
            throw new ForbiddenException('Error While Uploading File!');
          }
        },
      );
    }
    cb(null, process.env.UTILS_PATH_AVATARS);
  }

  @Post('uploads')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.diskStorage({
        destination: UserController.destinationPath,
        filename: UserController.customFileName,
      }),
    }),
  )
  async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file) {
      throw new ForbiddenException('File is required');
    }
    if (file.size > 1024 * 1024 * 2) {
      throw new ForbiddenException('File size must be less than 2MB');
    }
    await this.userService.updatePicUrl(req.user.username, file.filename);
  }

  static async checkFile(filename: string) {
    try {
      await fs.promises.access(process.env.UTILS_PATH_AVATARS + filename)
      return true;
    } catch (error) {
      return false;
    }
  }

  static async checkFileTheme(filename: string) {
    try {
      await fs.promises.access(process.env.UTILS_PATH_THEMES + filename)
      return true;
    } catch (error) {
      return false;
    }
  }

  @Get('avatars/:filename')
  async getPicture(@Param('filename') filename: string, @Res() res: any) {
    const file = await UserController.checkFile(filename);
    if (!file) {
      throw new ForbiddenException('Picture not found in the server');
    }
    res.sendFile(filename, { root: process.env.UTILS_PATH_AVATARS });
  }

  @Get('themes/:filename')
  async getTheme(@Param('filename') filename: string, @Res() res: any) {
    const file = await UserController.checkFileTheme(filename);
    if (!file) {
      throw new ForbiddenException('Picture not found in the server');
    }
    res.sendFile(filename, { root: process.env.UTILS_PATH_THEMES });
  }

}
