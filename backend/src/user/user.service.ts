import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import * as crypto from 'crypto';
import { IGameFinished } from 'src/game/utils/IGameFinished';
import { findIndex } from 'rxjs';

@Injectable()
export class UserService {
    constructor(
        private prisma: PrismaService,
    ) { }

    async setUserOnline(user: User) {
        await this.prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                status: 'online',
            }
        });
    }

    async setUserOffline(user: User) {
        await this.prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                status: 'offline',
            }
        });
    }

    async setUserPlaying(user: User) {
        await this.prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                status: 'playing',
            }
        });
    }

    async findUserByUsername(username: string): Promise<User> {
        //fetch data from db
        if (!username)
            return null;
        return await this.prisma.user.findUnique({
            where: {
                username: username,
            },
        });
    }

    async findUserByLogin(login: string): Promise<User> {
        //fetch data from db
        if (!login)
            return null;
        return await this.prisma.user.findUnique({
            where: {
                login: login,
            },
        });
    }

    async findUserByFyId(id: number): Promise<User> {
        //fetch data from db
        if (id === undefined)
            return null;
        return await this.prisma.user.findUnique({
            where: {
                fyId: id,
            },
        });
    }

    async findUserById(id: string): Promise<User> {
        //fetch data from db
        if (id === undefined)
            return null;
        return await this.prisma.user.findUnique({
            where: {
                id: id,
            },
        });
    }

    async getAllBlockedUsernames(user: User) {
        const blockedUsers = await this.prisma.friendrequest.findMany({
            where: {
                senderId: user.id,
                status: 'blocked',
            },
            select: {
                receiver: {
                    select: {
                        username: true,
                    },
                },
            },
        });
        const blockedUsernames = blockedUsers.map(user => user.receiver.username);
        return (blockedUsernames);
    }

    async getUser(user: User) {
        if (!user) {
            throw new NotFoundException(`User not found`);
        }
        const userToSend = {
            login: user.login,
            username: user.username,
            email: user.email,
            picUrl: user.picUrl,
            Wins: user.Wins,
            Losses: user.Losses,
            status: user.status,
            xp: user.xp,
        };
        return userToSend;
    }

    async getUserOther(username: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                username: username,
            },
        });
        if (!user) {
            throw new NotFoundException(`User not found`);
        }
        const userToSend = {
            login: user.login,
            username: user.username,
            email: user.email,
            picUrl: user.picUrl,
            Wins: user.Wins,
            Losses: user.Losses,
            status: user.status,
            xp: user.xp,
        };
        return userToSend;
    }

    async createUser(user: any) {
        const data = {
            fyId: user.id,
            username: user.login,
            login: user.login,
            picUrl: user.image.link,
            email: user.email,
            twoFactorAuthenticationSecret: '',
        };
        const newUser = await this.prisma.user.create({
            data,
        })
        return newUser;
    }

    isValidUsername(username: string) {
        const minLen = 3;
        const maxLen = 15; 
        const regex = /^[a-zA-Z0-9_-]+$/;

        if (!regex.test(username)) {
            throw new UnauthorizedException('Username must only contain alphanumeric characters, hyphens, and underscore');
        } else if (username.length < minLen) {
            throw new UnauthorizedException(`Username must be ${minLen} long at least`);
        } else if (username.length > maxLen) {
            throw new UnauthorizedException(`Username must not be more than ${maxLen} long`);
        }
    }

    async updateUsername(username: string, newUsername: string) {
        if (username === newUsername)
            return true;
        if (await this.findUserByUsername(newUsername)) {
            throw new UnauthorizedException('Username already used');
        }
        this.isValidUsername(newUsername);
        await this.prisma.user.update({
            where: {
                username: username,
            },
            data: {
                username: newUsername,
            },
        });
        return true;
    }

    isValidEmail(email: string): boolean {
        const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(email);
    }

    async updateEmail(username: string, newEmail: string) {
        const check = await this.prisma.user.findUnique({
            where: {
                email: newEmail,
            },
        });
        if (check && check.username != username) {
            throw new UnauthorizedException('Email already used');
        }
        if (!this.isValidEmail(newEmail)) {
            throw new UnauthorizedException('Wrong email format');
        }
        await this.prisma.user.update({
            where: {
                username: username,
            },
            data: {
                email: newEmail,
            },
        });
        return true;
    }

    async updatePicUrl(username: string, newPicName: string) {
        await this.prisma.user.update({
            where: {
                username: username,
            },
            data: {
                picUrl: process.env.BACKEND_UPLOADS + newPicName,
            },
        });
    }

    async turnOn2fa(username: string, secret: string) {

        await this.prisma.user.update({
            where: {
                username: username,
            },
            data: {
                twofactor: true,
                twoFactorAuthenticationSecret: secret,
            },
        });
    }

    async turnOff2fa(username: string) {
        await this.prisma.user.update({
            where: {
                username: username,
            },
            data: {
                twofactor: false,
                twoFactorAuthenticationSecret: '',
            },
        });
    }

    async get2faSecret(username: string): Promise<string> {
        const user = await this.prisma.user.findUnique({
            where: {
                username: username,
            },
        });
        return user.twoFactorAuthenticationSecret;
    }

    async add2FaState(username: string, state: string) {
        await this.prisma.user.update({
            where: {
                username: username,
            },
            data: {
                twofactorState: state,
            },
        });
    }

    async get2FaState(username: string, state: string): Promise<string> {
        const user = await this.prisma.user.findUnique({
            where: {
                username: username,
            },
        });
        if (!user)
            return "";
        return user.twofactorState;
    }

    async getFriendRequest(user: User) {
        const request = await this.prisma.friendrequest.findMany({
            where: {
                receiverId: user.id,
            },
            select: {
                createdAt: true,
                status: true,
                sender: {
                    select: {
                        username: true,
                        picUrl: true,
                    },
                },
                receiver: {
                    select: {
                        username: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            },
        }
        );
        return (request);
    }

    async getFriendRequestUser(username: string, rUsername: string) {
        const sender = await this.findUserByUsername(username);
        const receiver = await this.findUserByUsername(rUsername);

        const request = await this.prisma.friendrequest.findFirst({
            where: {
                senderId: sender.id,
                receiverId: receiver.id,
            },
            select: {
                status: true,
            }
        });
        return (request);
    }

    async acceptFriendRequest(receiver: User, rUsername: string) {
        const sender = await this.findUserByUsername(rUsername);

        const send = await this.prisma.friendrequest.update({
            where: {
                senderId_receiverId: {
                    senderId: sender.id,
                    receiverId: receiver.id,
                },
            },
            data: {
                status: 'accepted',
            }
        });
        if (!send) {
            throw new ForbiddenException('Friend request cannot be accepted');
        }
        const rsend = await this.prisma.friendrequest.upsert({
            where: {
                senderId_receiverId: {
                    senderId: receiver.id,
                    receiverId: sender.id,
                },
            },
            update: {
                status: 'accepted',
            },
            create: {
                senderId: receiver.id,
                receiverId: sender.id,
                status: 'accepted',
            },
        });
        if (rsend) {
            return 'Friend request accepted!';
        } else {
            throw new ForbiddenException('Friend request cannot be accepted');
        }
    }

    async declineFriendRequest(receiver: User, rUsername: string) {
        const sender = await this.findUserByUsername(rUsername);

        const send = await this.prisma.friendrequest.update({
            where: {
                senderId_receiverId: {
                    senderId: sender.id,
                    receiverId: receiver.id,
                },
            },
            data: {
                status: 'declined',
            }
        });
        if (send) {
            return 'Friend request declined!';
        } else {
            throw new ForbiddenException('Friend request cannot be declined');
        }
    }

    async isBlockUsername(user: User, targetUsername: string) {
        const targetUser = await this.findUserByUsername(targetUsername);
        if (!targetUser) {
            throw new ForbiddenException('Unknow user');
        }
        return (await this.isblockedUser(targetUser, user));
    }

    async isblockedUser(user: User, targetUser: User) {
        const checkBlocked = await this.prisma.friendrequest.findFirst({
            where: {
                senderId: targetUser.id,
                receiverId: user.id,
                status: 'blocked',
            },
        });
        if (checkBlocked) {
            return (true);
        }
        return (false);
    }

    async createFriendRequest(sender: User, rUsername: string) {
        const receiver = await this.findUserByUsername(rUsername);
        if (!sender || !receiver) {
            throw new ForbiddenException('Unknow user');
        }

        if (await this.isblockedUser(sender, receiver)) {
            throw new ForbiddenException('This user blocked you');
        }

        const send = await this.prisma.friendrequest.upsert({
            where: {
                senderId_receiverId: {
                    senderId: sender.id,
                    receiverId: receiver.id,
                },
            },
            update: {
                status: 'pending',
            },
            create: {
                senderId: sender.id,
                receiverId: receiver.id,
                status: 'pending',
            },
        });
        if (send) {
            return 'Friend request sent';
        } else {
            throw new ForbiddenException('Friend request not sent');
        }
    }

    async unblockUser(user: User, toUnblockUsername: string) {
        const toUnblockUser = await this.findUserByUsername(toUnblockUsername);
        if (!toUnblockUser) {
            throw new ForbiddenException(`This user doesnt exist`);
        }
        try {
            await this.prisma.friendrequest.delete({
                where: {
                    senderId_receiverId: {
                        senderId: user.id,
                        receiverId: toUnblockUser.id,
                    },
                },
            });
        } catch { }
        return (`${toUnblockUsername} has been unblocked!`);
    }

    async blockUser(user: User, toBlockUsername: string) {
        const toBlockUser = await this.findUserByUsername(toBlockUsername);
        if (!toBlockUser) {
            throw new ForbiddenException(`This user doesnt exist`);
        }
        try {
            const tmp = await this.prisma.friendrequest.findUnique({
                where: {
                    senderId_receiverId: {
                        senderId: toBlockUser.id,
                        receiverId: user.id,
                    },
                },
            });
            if (tmp && tmp.status !== 'blocked') {
                await this.prisma.friendrequest.delete({
                    where: {
                        senderId_receiverId: {
                            senderId: toBlockUser.id,
                            receiverId: user.id,
                        },
                    },
                });
            }

            await this.prisma.friendrequest.upsert({
                where: {
                    senderId_receiverId: {
                        senderId: user.id,
                        receiverId: toBlockUser.id,
                    },
                },
                update: {
                    status: 'blocked',
                },
                create: {
                    senderId: user.id,
                    receiverId: toBlockUser.id,
                    status: 'blocked',
                }
            });
            return (`${toBlockUsername} has been blocked!`);
        } catch (error) {
            throw new ForbiddenException(error);
        }
    }

    async cancelFriendRequest(sender: User, rUsername: string) {
        const receiver = await this.findUserByUsername(rUsername);

        const checkstatus = await this.prisma.friendrequest.findFirst({
            where: {
                senderId: sender.id,
                receiverId: receiver.id,
                status: 'pending',
            },
        });
        if (checkstatus) {
            const cancel = await this.prisma.friendrequest.delete({
                where: {
                    senderId_receiverId: {
                        senderId: sender.id,
                        receiverId: receiver.id,
                    },
                },
            });
            if (cancel) {
                return 'Friend request canceled!';
            }
        }
        throw new ForbiddenException('Friend request not canceled');
    }

    async deleteFriendRequest(sender: User, rUsername: string) {
        const receiver = await this.findUserByUsername(rUsername);

        const checkstatus = await this.prisma.friendrequest.findFirst({
            where: {
                senderId: sender.id,
                receiverId: receiver.id,
                status: 'accepted',
            },
        });
        const rcheckstatus = await this.prisma.friendrequest.findFirst({
            where: {
                senderId: receiver.id,
                receiverId: sender.id,
                status: 'accepted',
            },
        });
        if (checkstatus && rcheckstatus) {
            const remove = await this.prisma.friendrequest.delete({
                where: {
                    senderId_receiverId: {
                        senderId: sender.id,
                        receiverId: receiver.id,
                    },
                },
            });
            const rremove = await this.prisma.friendrequest.delete({
                where: {
                    senderId_receiverId: {
                        senderId: receiver.id,
                        receiverId: sender.id,
                    },
                },
            });
            if (rremove) {
                return 'Friend removed!';
            }
        }
        throw new ForbiddenException('Friend connot be removed');
    }

    async getFriends(user: User) {

        const friends = await this.prisma.friendrequest.findMany({
            where: {
                receiverId: user.id,
                status: 'accepted',
            },
            select: {
                sender: {
                    select: {
                        username: true,
                        picUrl: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'asc'
            },
        }
        );
        return (friends);
    }

    async isFriend(user: User, friend: User) {
        const checkFriend = await this.prisma.friendrequest.findFirst({
            where: {
                receiverId: friend.id,
                senderId: user.id,
                status: 'accepted',
            }
        });
        if (!checkFriend) {
            return (false);
        }
        return (true);
    }

    async getGameHistory(user: User) {
        const allGames = await this.prisma.game.findMany({
            where: {
                OR: [
                    { winnerId: user.id },
                    { loserId: user.id }
                ]
            },
            select: {
                updatedAt: true,
                winnerScore: true,
                loserScore: true,
                winner: {
                    select: {
                        username: true,
                        picUrl: true,
                    },
                },
                loser: {
                    select: {
                        username: true,
                        picUrl: true,
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            }
        });
        return ({ username: user.username, gameHistory: allGames });
    }

    async getXpUser(userId: string) {
        const xpUser = await this.prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                xp: true,
            }
        });
        if (!xpUser) {
            return (0);
        }
        return (xpUser.xp);
    }

    async addXPGainUser(
        finishedGame: IGameFinished,
        user: User,
        isWin: boolean,
    ) {
        const scoreSpan = Math.abs(finishedGame.createrScore - finishedGame.invitedScore);
        const opponentId = user.id === finishedGame.createrId ? finishedGame.invitedId : finishedGame.createrId;
        const opponentXP = await this.getXpUser(opponentId);
        const xpGained = this.calculateXPGain(isWin, scoreSpan, user.xp, opponentXP);
        const newLose = isWin ? user.Losses : user.Losses + 1;
        const newWin = isWin ? user.Wins + 1 : user.Wins;

        await this.prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                Losses: newLose,
                Wins: newWin,
                xp: user.xp + xpGained,
            },
        });
    }

    calculateXPGain(
        isWin: boolean,
        scoreSpan: number,
        currentPlayerXP: number,
        opponentXP: number,
    ): number {
        const WIN_XP = 100;
        const LOSS_XP = 50;
        const SCORE_SPAN_MULTIPLIER = 0.1;
        const LEVEL_DIFF_MULTIPLIER = 0.02;
        const PLAYER_XP_DECREASE_FACTOR = 0.0001;

        let baseXP = isWin ? WIN_XP : LOSS_XP;

        let additionalXP = scoreSpan * SCORE_SPAN_MULTIPLIER;

        let levelDiffXP = (opponentXP - currentPlayerXP) * LEVEL_DIFF_MULTIPLIER;
        levelDiffXP = Math.max(0, levelDiffXP);

        let playerXPDecrease = currentPlayerXP * PLAYER_XP_DECREASE_FACTOR;
        playerXPDecrease = Math.min(baseXP + additionalXP + levelDiffXP, playerXPDecrease);

        let totalXPGained = baseXP + additionalXP + levelDiffXP - playerXPDecrease;

        return Math.round(totalXPGained);
    }

    async getLeaderboard() {
        const leaderboard = await this.prisma.user.findMany({
            orderBy: {
                xp: 'desc',
            },
            take: 10,
            select: {
                username: true,
                xp: true,
                picUrl: true,
                login: true,
                email: true,
                Wins: true,
                Losses: true,
                status: true,
            }
        });
        return (leaderboard);
    }

    encrypt(text: string): string {
        const secretPass = process.env.ENCRYPT_SECRET;
        const secretKey = crypto.createHash('sha256').update(String(secretPass)).digest('base64').slice(0, 32);
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    }

    decrypt(text: string): string {
        const secretPass = process.env.ENCRYPT_SECRET;
        const secretKey = crypto.createHash('sha256').update(String(secretPass)).digest('base64').slice(0, 32);
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }
}
