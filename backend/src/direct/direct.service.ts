import { ForbiddenException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import { GameService } from 'src/game/game.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class DirectService {
    constructor(
        private prisma: PrismaService,
        private userService: UserService,
        private gameService: GameService,
    ) { }

    async findMessageById(messageId: string) {
        const message = await this.prisma.directMessage.findUnique({
            where: {
                id: messageId,
            }
        });
        return (message);
    }

    async getMessages(user: User, friendUsername: string) {
        const friend = await this.userService.findUserByUsername(friendUsername);
        if (!friend) {
            throw new ForbiddenException(`This user doesnt exist`);
        }
        if (!await this.userService.isFriend(user, friend)) {
            throw new ForbiddenException(`You are not friend with this user`);
        }
        try {
            const messages = await this.prisma.directMessage.findMany({
                where: {
                    OR: [
                        { AND: [{ senderId: user.id }, { receiverId: friend.id }] },
                        { AND: [{ senderId: friend.id }, { receiverId: user.id }] }
                    ]
                },
                select: {
                    id: true,
                    createdAt: true,
                    msg: true,
                    sender: {
                        select: {
                            username: true,
                            picUrl: true,
                        },
                    },
                    type: true,
                },
                orderBy: {
                    createdAt: 'asc',
                }
            });
            return (messages);
        } catch (error) {
            throw new ForbiddenException(error);
        }
    }

    async getDirectMessInviteGameFriend(user: User, friend: User) {
        const messInviteGame = await this.prisma.directMessage.findFirst({
            where: {
                senderId: user.id,
                receiverId: friend.id,
                type: 'game',
            },
        });
        return (messInviteGame);
    }

    async sendMessage(user: User, friendUsername: string, msg: string, type: string) {
        const friend = await this.userService.findUserByUsername(friendUsername);
        if (!friend) {
            throw new ForbiddenException(`This user doesnt exist`);
        }
        if (!await this.userService.isFriend(user, friend)) {
            throw new ForbiddenException(`You are not friend with this user`);
        }
        if (type === 'game') {
            const prevMessInvite = await this.getDirectMessInviteGameFriend(user, friend);
            if (prevMessInvite) {
                await this.prisma.directMessage.update({
                    where: {
                        id: prevMessInvite.id,
                    },
                    data: {
                        createdAt: new Date(),
                    },
                });
                return;
            }
        }
        const data = {
            senderId: user.id,
            receiverId: friend.id,
            msg: msg,
            type: type,
        }
        const newMessage = await this.prisma.directMessage.create({
            data: data,
        });
        if (type === 'game') {
            await this.gameService.createGameInviteDirectMess(newMessage.id, user);
        }

    }

    async wsJoinFriend(client: Socket, user: User, friendName: string) {
        await client.join(friendName + user.username);
        await client.join(user.username + friendName);
    }

    async getLastMessage(user: User, friendUsername: string, msg: string) {
        const friend = await this.userService.findUserByUsername(friendUsername);
        if (!friend) {
            throw new ForbiddenException(`This user doesnt exist`);
        }
        if (!await this.userService.isFriend(user, friend)) {
            throw new ForbiddenException(`You are not friend with this user`);
        }
        try {
            const message = await this.prisma.directMessage.findFirst({
                where: {
                    senderId: user.id,
                    receiverId: friend.id,
                    msg: msg,
                },
                select: {
                    id: true,
                    createdAt: true,
                    msg: true,
                    sender: {
                        select: {
                            username: true,
                            picUrl: true,
                        },
                    },
                    type: true,
                },
                orderBy: {
                    createdAt: 'desc',
                }
            });
            return (message);
        } catch (error) {
            throw new ForbiddenException(error);
        }
    }

    async deleteDirectMessage(directMessageId: string) {
        await this.prisma.directMessage.delete({
            where: {
                id: directMessageId,
            }
        });
    }
}
