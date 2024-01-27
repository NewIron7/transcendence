import { Injectable } from '@nestjs/common';
import { User, currentGame } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { GameState } from './utils/game.state';
import { setInterval } from 'timers';
import { IBall, IPaddle, IUpdatePaddle, initializeBall } from './utils/IGameElems';
import { IGameFinished } from './utils/IGameFinished';
import { UserService } from 'src/user/user.service';

@Injectable()
export class GameService {
    constructor(
        private userService: UserService,
        private prisma: PrismaService,
    ) { }

    WIDTH = +(process.env.NEXT_PUBLIC_RES_WIDTH || "");
    HEIGHT = +(process.env.NEXT_PUBLIC_RES_HEIGHT || "");

    public activeGames: { [gameId: string]: GameState } = {};

    gameLoop(server: Server, currentGame: currentGame) {
        const gameState = this.activeGames[currentGame.id];
        if (!gameState) {
            return;
        }

        const creater = gameState.createrPaddle;
        const invited = gameState.invitedPaddle;
        let ball = gameState.ball;

        if ((ball.x - ball.radius) < 0) {
            invited.score++;
            if (invited.score >= currentGame.winScore) {
                server.to(currentGame.id).emit('end_game');
                this.endGame(currentGame.id, server);
                return;
            }
            gameState.ball = initializeBall();
            ball = gameState.ball;
        } else if ((ball.x + ball.radius) > this.WIDTH) {
            creater.score++;
            if (creater.score >= currentGame.winScore) {
                server.to(currentGame.id).emit('end_game');
                this.endGame(currentGame.id, server);
                return;
            }
            gameState.ball = initializeBall();
            gameState.ball.velocityX *= -1;
            ball = gameState.ball;
        }

        ball.x += ball.velocityX;
        ball.y += ball.velocityY;

        if (ball.y - ball.radius < 0 || ball.y + ball.radius > this.HEIGHT) {
            ball.velocityY = -ball.velocityY;
        }

        const player = (ball.x + ball.radius < this.WIDTH / 2) ? creater : invited;
        if (this.checkCollision(ball, player)) {

            let collidePoint = (ball.y - (player.y + player.height / 2));
            collidePoint = collidePoint / (player.height / 2);

            let angleRad = (Math.PI / 4) * collidePoint;

            let direction = (ball.x + ball.radius < this.WIDTH / 2) ? 1 : -1;
            ball.velocityX = direction * ball.speed * Math.cos(angleRad);
            ball.velocityY = ball.speed * Math.sin(angleRad);

            ball.speed += 0.5;
        }

        server.to(currentGame.id).emit('update', gameState.light());
    }

    async endGame(currentGameId: string, server: Server) {
        try {
            if (!this.activeGames[currentGameId]) {
                return;
            }

            const currentGame = await this.findCurrentGameById(currentGameId);
            if (!currentGame) {
                return;
            }
            const endedGame: IGameFinished = await this.prisma.currentGame.delete({
                where: {
                    id: currentGame.id,
                },
                include: {
                    creater: {
                        select: {
                            id: true,
                            xp: true
                        }
                    },
                    invited: {
                        select: {
                            id: true,
                            xp: true
                        }
                    },
                }
            });

            await this.saveFinishedGame(endedGame);

            clearInterval(this.activeGames[currentGameId].intervalId as NodeJS.Timeout);
            delete this.activeGames[currentGameId];
            server.in(endedGame.id).socketsLeave(endedGame.id);
        } catch (e) {
        }

    }

    async saveFinishedGame(finishedGame: IGameFinished) {
        const gameState = this.activeGames[finishedGame.id];
        if (!gameState) {
            return;
        }
        finishedGame.createrScore = gameState.createrPaddle.score;
        finishedGame.invitedScore = gameState.invitedPaddle.score;
        let winnerId: string;
        let winnerScore: number;
        let loserId: string;
        let loserScore: number;
        if (finishedGame.createrScore >= finishedGame.invitedScore) {
            winnerId = finishedGame.createrId;
            winnerScore = finishedGame.createrScore;
            loserId = finishedGame.invitedId;
            loserScore = finishedGame.invitedScore;
        } else {
            winnerId = finishedGame.invitedId;
            winnerScore = finishedGame.invitedScore;
            loserId = finishedGame.createrId;
            loserScore = finishedGame.createrScore;
        }

        const isWin = winnerId === finishedGame.createrId ? true : false;
        const creater = await this.userService.findUserById(finishedGame.createrId);
        await this.userService.addXPGainUser(finishedGame, creater, isWin);

        const opponentId = isWin ? loserId : winnerId;
        const opponent = await this.userService.findUserById(opponentId);
        await this.userService.addXPGainUser(finishedGame, opponent, !isWin);

        await this.prisma.game.create({
            data: {
                winnerId,
                winnerScore,
                loserId,
                loserScore,
            }
        });
    }

    updatePaddlePos(currentGameId: string, newUpdatePaddle: IUpdatePaddle) {
        const gameState = this.activeGames[currentGameId];
        if (!gameState) {
            return;
        }

        if (newUpdatePaddle.isCreater) {
            gameState.createrPaddle.y = newUpdatePaddle.y;
        } else {
            gameState.invitedPaddle.y = newUpdatePaddle.y;
        }
    }

    checkCollision(b: IBall, p: IPaddle) {
        if (!p)
            return (false);
        const ptop = p.y;
        const pbottom = p.y + p.height;
        const pleft = p.x;
        const pright = p.x + p.width;

        const btop = b.y - b.radius;
        const bbottom = b.y + b.radius;
        const bleft = b.x - b.radius;
        const bright = b.x + b.radius;

        return pleft < bright && ptop < bbottom && pright > bleft && pbottom > btop;
    }

    startGame(server: Server, currentGame: currentGame) {
        const newGameState = new GameState();
        this.activeGames[currentGame.id] = newGameState;
        newGameState.intervalId = setInterval(() => this.gameLoop(server, currentGame), 1000 / (+process.env.FPS));
    }

    async findInviteGameById(inviteGameId: string) {
        const inviteGame = await this.prisma.inviteGame.findUnique({
            where: {
                id: inviteGameId,
            }
        });
        return (inviteGame);
    }

    async findFreeGame() {
        const freeGame = await this.prisma.currentGame.findFirst({
            where: {
                invitedId: null,
            },
            select: {
                id: true,
                createdAt: true,
                createrId: true,
                createrScore: true,
                invitedId: true,
                invitedScore: true,
                winScore: true,
                creater: {
                    select: {
                        username: true,
                        picUrl: true,
                        xp: true,
                    }
                },
                invited: {
                    select: {
                        username: true,
                        picUrl: true,
                        xp: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
        return (freeGame);
    }

    async createInviteCurrentGame(createrId: string, invitedId: string) {
        await this.prisma.currentGame.create({
            data: {
                createrId: createrId,
                invitedId: invitedId,
            }
        });
    }

    async createGame(user: User) {
        const data = {
            createrId: user.id,
        }
        const gameCreated = await this.prisma.currentGame.create({
            data: data,
            select: {
                id: true,
                createdAt: true,
                createrId: true,
                createrScore: true,
                invitedId: true,
                invitedScore: true,
                winScore: true,
                creater: {
                    select: {
                        username: true,
                        picUrl: true,
                        xp: true,
                    }
                },
                invited: {
                    select: {
                        username: true,
                        picUrl: true,
                        xp: true,
                    }
                }
            },
        });
        return (gameCreated);
    }

    async joinFreeGame(user: User) {
        const currentGame = await this.findCurrentGame(user);
        if (currentGame) {
            return (currentGame);
        }
        const freeGame = await this.findFreeGame();
        if (freeGame) {
            const gameJoined = await this.prisma.currentGame.update({
                where: {
                    id: freeGame.id,
                },
                data: {
                    invitedId: user.id,
                },
                select: {
                    id: true,
                    createdAt: true,
                    createrId: true,
                    createrScore: true,
                    invitedId: true,
                    invitedScore: true,
                    winScore: true,
                    creater: {
                        select: {
                            username: true,
                            picUrl: true,
                            xp: true,
                        }
                    },
                    invited: {
                        select: {
                            username: true,
                            picUrl: true,
                            xp: true,
                        }
                    }
                },
            });
            return (gameJoined);
        } else {
            const gameCreated = await this.createGame(user);
            return (gameCreated);
        }
    }

    async findCurrentGame(user: User) {
        const currentGame = await this.prisma.currentGame.findFirst({
            where: {
                OR: [
                    { createrId: user.id },
                    { invitedId: user.id }
                ]
            },
            select: {
                id: true,
                createdAt: true,
                createrId: true,
                createrScore: true,
                invitedId: true,
                invitedScore: true,
                winScore: true,
                creater: {
                    select: {
                        username: true,
                        picUrl: true,
                        xp: true,
                    }
                },
                invited: {
                    select: {
                        username: true,
                        picUrl: true,
                        xp: true,
                    }
                }
            }
        });
        return (currentGame);
    }

    async findCurrentGameById(id: string) {
        const currentGame = await this.prisma.currentGame.findUnique({
            where: {
                id: id,
            }
        });
        return currentGame;
    }

    async saveFinishedGameLeaving(finishedGame: IGameFinished, leavingUser: User) {
        if (!finishedGame.invitedId) {
            return;
        }
        const gameState = this.activeGames[finishedGame.id];
        if (!gameState) {
            return;
        }
        finishedGame.createrScore = gameState.createrPaddle.score;
        finishedGame.invitedScore = gameState.invitedPaddle.score;
        let winnerId: string;
        let winnerScore: number;
        let loserId: string;
        let loserScore: number;
        if (finishedGame.createrScore < finishedGame.winScore
            && finishedGame.invitedScore < finishedGame.winScore) {
            if (leavingUser.id == finishedGame.createrId) {
                winnerId = finishedGame.invitedId;
                winnerScore = finishedGame.invitedScore;
                loserId = finishedGame.createrId;
                loserScore = finishedGame.createrScore;
            } else {
                winnerId = finishedGame.createrId;
                winnerScore = finishedGame.createrScore;
                loserId = finishedGame.invitedId;
                loserScore = finishedGame.invitedScore;
            }
        }
        else if (finishedGame.createrScore > finishedGame.invitedScore) {
            winnerId = finishedGame.createrId;
            winnerScore = finishedGame.createrScore;
            loserId = finishedGame.invitedId;
            loserScore = finishedGame.invitedScore;
        } else if (finishedGame.createrScore < finishedGame.invitedScore) {
            winnerId = finishedGame.invitedId;
            winnerScore = finishedGame.invitedScore;
            loserId = finishedGame.createrId;
            loserScore = finishedGame.createrScore;
        } else {
            if (leavingUser.id == finishedGame.createrId) {
                winnerId = finishedGame.invitedId;
                winnerScore = finishedGame.invitedScore;
                loserId = finishedGame.createrId;
                loserScore = finishedGame.createrScore;
            } else {
                winnerId = finishedGame.createrId;
                winnerScore = finishedGame.createrScore;
                loserId = finishedGame.invitedId;
                loserScore = finishedGame.invitedScore;
            }
        }

        const isWin = winnerId === leavingUser.id ? true : false;
        await this.userService.addXPGainUser(finishedGame, leavingUser, isWin);
        const opponentId = isWin ? loserId : winnerId;
        const opponent = await this.userService.findUserById(opponentId);
        await this.userService.addXPGainUser(finishedGame, opponent, !isWin);

        await this.prisma.game.create({
            data: {
                winnerId,
                winnerScore,
                loserId,
                loserScore,
            }
        });
    }

    async leaveCurrentGame(user: User) {
        const currentGame = await this.findCurrentGame(user);
        if (currentGame) {
            const leftGame = await this.prisma.currentGame.delete({
                where: {
                    id: currentGame.id,
                },
                include: {
                    creater: {
                        select: {
                            id: true,
                            xp: true
                        }
                    },
                    invited: {
                        select: {
                            id: true,
                            xp: true
                        }
                    },
                }
            });
            await this.saveFinishedGameLeaving(leftGame, user);
            return (leftGame);
        }
        return null;
    }

    async createGameInviteMess(messageId: string, user: User) {
        const newGameInvite = await this.prisma.inviteGame.create({
            data: {
                createrId: user.id,
                messageId: messageId,
            }
        });
        if (!newGameInvite) {
            return;
        }
    }

    async createGameInviteDirectMess(messageId: string, user: User) {
        const newGameInvite = await this.prisma.inviteGame.create({
            data: {
                createrId: user.id,
                directMessageId: messageId,
            }
        });
        if (!newGameInvite) {
            return;
        }
    }

    async checkWaitGameStart(inviteGameId: string) {
        const checkStatus = await this.findInviteGameById(inviteGameId);
        if (!checkStatus) {
            return (false);
        }
        return (checkStatus.createrJoined && checkStatus.invitedJoined);
    }

    async cancelWaitGameMess(user: User, messageId: string) {
        const inviteGame = await this.prisma.inviteGame.findUnique({
            where: {
                messageId: messageId,
            },
        });
        if (!inviteGame
            || (inviteGame.createrId != user.id
                && inviteGame.invitedId != user.id)
        ) {
            return (null);
        }
        if (inviteGame.createrId === user.id) {
            await this.prisma.inviteGame.update({
                where: {
                    id: inviteGame.id,
                },
                data: {
                    createrJoined: false,
                }
            });
        } else {
            await this.prisma.inviteGame.update({
                where: {
                    id: inviteGame.id,
                },
                data: {
                    invitedId: null,
                    invitedJoined: false,
                }
            });
        }
        return (inviteGame);
    }

    async cancelWaitGameDirect(user: User, directMessageId: string) {
        const inviteGame = await this.prisma.inviteGame.findUnique({
            where: {
                directMessageId: directMessageId,
            },
        });
        if (!inviteGame
            || (inviteGame.createrId != user.id
                && inviteGame.invitedId != user.id)
        ) {
            return (null);
        }
        if (inviteGame.createrId === user.id) {
            await this.prisma.inviteGame.update({
                where: {
                    id: inviteGame.id,
                },
                data: {
                    createrJoined: false,
                }
            });
        } else {
            await this.prisma.inviteGame.update({
                where: {
                    id: inviteGame.id,
                },
                data: {
                    invitedId: null,
                    invitedJoined: false,
                }
            });
        }
        return (inviteGame);
    }

    async joinWaitGameMess(user: User, messageId: string) {
        const inviteGame = await this.prisma.inviteGame.findUnique({
            where: {
                messageId: messageId,
            },
        });
        if (!inviteGame
            || (inviteGame.createrJoined && inviteGame.invitedJoined)
        ) {
            return (null);
        }
        if (inviteGame.createrId === user.id) {
            await this.prisma.inviteGame.update({
                where: {
                    id: inviteGame.id,
                },
                data: {
                    createrJoined: true,
                }
            });
        } else {
            await this.prisma.inviteGame.update({
                where: {
                    id: inviteGame.id,
                },
                data: {
                    invitedId: user.id,
                    invitedJoined: true,
                }
            });
        }
        const updated = await this.findInviteGameById(inviteGame.id);
        return (updated);
    }

    async joinWaitGameDirect(user: User, directMessageId: string) {
        const inviteGame = await this.prisma.inviteGame.findUnique({
            where: {
                directMessageId: directMessageId,
            },
        });
        if (!inviteGame
            || (inviteGame.createrJoined && inviteGame.invitedJoined)
        ) {
            return (null);
        }
        if (inviteGame.createrId === user.id) {
            await this.prisma.inviteGame.update({
                where: {
                    id: inviteGame.id,
                },
                data: {
                    createrJoined: true,
                }
            });
        } else {
            await this.prisma.inviteGame.update({
                where: {
                    id: inviteGame.id,
                },
                data: {
                    invitedId: user.id,
                    invitedJoined: true,
                }
            });
        }
        const updated = await this.findInviteGameById(inviteGame.id);
        return (updated);
    }

    async isUserWaitingGame(user: User) {
        const waitingGames = await this.prisma.inviteGame.findMany({
            where: {
                OR: [
                    {
                        createrId: user.id,
                        createrJoined: true
                    },
                    {
                        invitedId: user.id,
                        invitedJoined: true
                    }
                ]
            },
        });
        return (waitingGames);
    }

    async wsJoinGame(client: Socket, server: Server, user: User, currentGameId: string) {
        try {
            const currentGame = await this.findCurrentGame(user);
            if (currentGame.id == currentGameId) {
                await client.join(currentGameId);
                server.to(currentGameId).emit('joinGame');
            }
        } catch { }
    }

    wsIsInRoom(client: Socket, currentGameId: string) {
        return Array.from(client.rooms).includes(currentGameId);
    }

}
