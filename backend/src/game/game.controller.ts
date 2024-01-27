import { Controller, Delete, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { GameService } from './game.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('game')
export class GameController {
    constructor(
        private gameService: GameService,
    ) { }

    @Get('join')
    @UseGuards(AuthGuard)
    async getCurrentGame(
        @Req() req: any,
    ){
        return await this.gameService.findCurrentGame(req.user);
    }

    @Post('join')
    @UseGuards(AuthGuard)
    async joinFreeGame(
        @Req() req: any,
    ){
        //join a free room or create one and wait
        return this.gameService.joinFreeGame(req.user);
    }
}
