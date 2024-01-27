import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { DirectService } from './direct.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('direct')
export class DirectController {
    constructor(
        private directService: DirectService,
    ) { }

    @Get('')
    @UseGuards(AuthGuard)
    async getMessages(
        @Query('username') friendUsername: string,
        @Req() req: any,
    ) {
        return await this.directService.getMessages(req.user, friendUsername);
    }

    @Post('')
    @UseGuards(AuthGuard)
    async sendMessage(
        @Query('username') friendUsername: string,
        @Body('msg') msg: string,
        @Body('type') type: string,
        @Req() req: any,
    ) {
        await this.directService.sendMessage(req.user, friendUsername, msg, type);
    }
}
