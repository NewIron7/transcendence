import { Body, Controller, Delete, ForbiddenException, Get, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoomService } from './room.service';
import { ICreateRoom } from './utils/ICreateRoom';

@Controller('room')
export class RoomController {
    constructor(
        private roomService: RoomService,
    ) { }

    @Get('membership')
    @UseGuards(AuthGuard)
    async getUserMembershipRoom(
        @Query('name') roomName: string,
        @Req() req: any,
    ) {
        return await this.roomService.getUserMembershipRoom(req.user, roomName);
    }

    @Post('')
    @UseGuards(AuthGuard)
    async createRoom(@Body() room: ICreateRoom, @Req() req: any) {
        return await this.roomService.createRoom(req.user, room);
    }

    @Post('invite')
    @UseGuards(AuthGuard)
    async invitePrivRoom(
        @Query('name') roomName: string,
        @Query('username') toInviteUsername: string,
        @Req() req: any,
    ) {
        return this.roomService.invitePrivRoom(req.user, roomName, toInviteUsername);
    }

    @Post('join')
    @UseGuards(AuthGuard)
    async joinRoom(
        @Query('name') roomName: string,
        @Body('password') roomPassword: string,
        @Req() req: any,
    ) {
        return this.roomService.joinRoom(req.user, roomName, roomPassword);
    }

    @Post('leave')
    @UseGuards(AuthGuard)
    async leaveRoom(
        @Query('name') roomName: string,
        @Req() req: any,
    ){
        return await this.roomService.leaveRoom(req.user, roomName);
    }

    @Get('name')
    @UseGuards(AuthGuard)
    async getRooms(@Req() req: any) {
        return await this.roomService.getUserRoomsName(req.user);
    }

    @Get('messages')
    @UseGuards(AuthGuard)
    async getMessagesRoom(
        @Query('name') roomName: string,
        @Req() req: any,
    ) {
        return await this.roomService.getMessagesRoom(req.user, roomName);
    }

    @Post('message')
    @UseGuards(AuthGuard)
    async sendMessageRoom(
        @Query('name') roomName: string,
        @Body('msg') msg: string,
        @Body('type') type: string,
        @Req() req: any,
    ) {
        await this.roomService.createMessage(req.user, roomName, msg, type);
    }

    @Post('password')
    @UseGuards(AuthGuard)
    async changePasswordRoom(
        @Query('name') roomName: string,
        @Body('newPassword') newPassword: string,
        @Req() req: any,
    ) {
        return await this.roomService.changePasswordRoom(req.user, roomName, newPassword);
    }

    @Delete('password')
    @UseGuards(AuthGuard)
    async deletePasswordRoom(
        @Query('name') roomName: string,
        @Req() req: any,
    ) {
        return await this.roomService.deletePasswordRoom(req.user, roomName);
    }

    @Post('admin')
    @UseGuards(AuthGuard)
    async addAdminRoom(
        @Query('name') roomName: string,
        @Body('username') newAdminUsername: string,
        @Req() req: any,
    ) {
        return await this.roomService.addAdminRoom(req.user, roomName, newAdminUsername);
    }

    @Post('kick')
    @UseGuards(AuthGuard)
    async kickUserRoom(
        @Query('name') roomName: string,
        @Body('username') username: string,
        @Req() req: any,
    ) {
        return await this.roomService.kickUserRoom(req.user, roomName, username);
    }

    @Post('ban')
    @UseGuards(AuthGuard)
    async banUserRoom(
        @Query('name') roomName: string,
        @Body('username') username: string,
        @Req() req: any,
    ) {
        return await this.roomService.banUserRoom(req.user, roomName, username);
    }

    @Post('mute')
    @UseGuards(AuthGuard)
    async muteUserRoom(
        @Query('name') roomName: string,
        @Body('username') username: string,
        @Body('end') end: Date,
        @Req() req: any,
    ) {
        return await this.roomService.muteUserRoom(req.user, roomName, username, end);
    }
}
