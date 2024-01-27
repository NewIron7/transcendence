import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { User, room } from '@prisma/client';
import { Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { GameService } from 'src/game/game.service';
import { ICreateRoom } from './utils/ICreateRoom';

@Injectable()
export class RoomService {
    constructor(
        private prisma: PrismaService,
        private userService: UserService,
        private gameService: GameService,
    ) { }

    async hashPassword(password: string): Promise<string> {
        const saltOrRounds = 10; // Define the number of rounds for salt generation
        return await bcrypt.hash(password, saltOrRounds);
    }

    async comparePasswords(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(plainTextPassword, hashedPassword);
    }

    async findRoomByName(name: string) {
        if (!name) {
            return null;
        }
        return await this.prisma.room.findFirst({
            where: {
                name: name,
            }
        });
    }

    async isUserRoom(user: User, roomName: string) {
        const room = await this.findRoomByName(roomName);
        if (!room) {
            return (false);
        }
        const membership = await this.prisma.membership.findFirst({
            where: {
                uid: user.id,
                rid: room.id,
                is_invite: false,
            }
        });
        if (membership && !membership.is_banned) {
            return (true);
        } else {
            return (false);
        }
    }

    checkRoomName(roomName: string) {
        const minLen = 3; // Minimum length
        const maxLen = 15; // Maximum length
        const regex = /^[a-zA-Z0-9_-]+$/; // Regex for alphanumeric characters, hyphens, and underscores

        if (!regex.test(roomName)) {
            throw new UnauthorizedException('Room name must only contain alphanumeric characters, hyphens, and underscores');
        } else if (roomName.length < minLen) {
            throw new UnauthorizedException(`Room name must be at least ${minLen} characters long`);
        } else if (roomName.length > maxLen) {
            throw new UnauthorizedException(`Room name must not be more than ${maxLen} characters long`);
        }
    }

    isValidRoomName(roomName: string) {
        try {
            this.checkRoomName(roomName);
            return (true);
        } catch {
            return (false);
        }
    }

    isValidPassword(password: string): void {
        const minLength = 3;
        const maxLength = 48;
        // Regex for allowed characters: alphanumeric and some special characters
        const regex = /^[A-Za-z\d@$!%*?&_-]+$/;

        if (password.length < minLength || password.length > maxLength) {
            throw new UnauthorizedException(`Password must be between ${minLength} and ${maxLength} characters long`);
        }

        if (!regex.test(password)) {
            throw new UnauthorizedException(
                'Password contains invalid characters. Only letters, numbers, and special characters (@, $, !, %, *, ?, &, _, -) are allowed.'
            );
        }
    }

    async createRoom(user: User, room: ICreateRoom) {
        if (!room.name && !room.type) {
            throw new BadRequestException('Name and type has to be provided');
        }
        const checkRoom = await this.findRoomByName(room.name);
        if (checkRoom) {
            throw new UnauthorizedException('Room\'s name already used');
        }
        if ((room.type === 'public' || room.type === 'private')
            && room.password) {
            throw new UnauthorizedException(`You cannot set password for ${room.type} room`);
        }
        if (room.type === 'protected') {
            if (!room.password) {
                throw new UnauthorizedException('You must set a password for protected room');
            }
            this.isValidPassword(room.password);
        }
        this.checkRoomName(room.name);
        try {
            const data = {
                name: room.name,
                type: room.type,
                password: await this.hashPassword(room.password),
            }
            const newRoom = await this.prisma.room.create({
                data: data,
            });
            const mData = {
                uid: user.id,
                rid: newRoom.id,
                is_owner: true,
                is_admin: true,
            }
            const newMember = await this.prisma.membership.create({
                data: mData,
            });
            return ("Room successfully created");
        } catch (error) {
            throw new ForbiddenException(error);
        }
    }

    async isInvitedPrivate(user: User, room: room) {
        const membership = await this.prisma.membership.findFirst({
            where: {
                uid: user.id,
                rid: room.id,
                is_invite: true,
            }
        });
        if (membership) {
            return (true);
        } else {
            return (false);
        }
    }

    async isBannedRoom(user: User, room: room) {
        const membership = await this.prisma.membership.findFirst({
            where: {
                uid: user.id,
                rid: room.id,
                is_banned: true,
            }
        });
        if (membership) {
            return (true);
        } else {
            return (false);
        }
    }

    private formatReadableDate(date: Date) {
        const nDate = new Date(date);
        const str = nDate.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            timeZoneName: 'short'
        });
        return (str);
    }

    async isMutedRoom(user: User, room: room) {
        const membership = await this.prisma.membership.findFirst({
            where: {
                uid: user.id,
                rid: room.id,
                is_muted: true,
            }
        });
        const timeNow = new Date();
        if (membership && membership.duration >= timeNow) {
            return (this.formatReadableDate(membership.duration));
        } else if (membership) {
            await this.prisma.membership.update({
                where: {
                    id: membership.id,
                },
                data: {
                    is_muted: false,
                }
            });
        }
        return (null);
    }

    async invitePrivRoom(user: User, roomName: string, toInviteUsername: string) {
        const checkRoom = await this.findRoomByName(roomName);
        if (!checkRoom) {
            throw new ForbiddenException(`Room ${roomName} does not exist`);
        }
        const toInviteUser = await this.userService.findUserByUsername(toInviteUsername);
        if (!toInviteUser) {
            throw new ForbiddenException(`This user doesnt exist`);
        }
        if (checkRoom.type != 'private') {
            throw new ForbiddenException(`This room is not private`);
        }
        if (await this.isUserRoom(toInviteUser, roomName)) {
            throw new ForbiddenException(`${toInviteUser.username} already in this room`);
        }
        if (await this.isInvitedPrivate(toInviteUser, checkRoom)) {
            throw new ForbiddenException(`${toInviteUser.username} already invited to this room`);
        }
        if (!await this.isUserRoom(user, roomName)) {
            throw new ForbiddenException(`You cannot invite people if you are not in the room`);
        }
        try {
            const data = {
                uid: toInviteUser.id,
                rid: checkRoom.id,
                is_invite: true,
            }
            const newInvite = await this.prisma.membership.create({
                data: data,
            });
            return ("Invitation successfully created");
        } catch (error) {
            throw new ForbiddenException(error);
        }
    }

    async joinPrivateRoom(user: User, room: room) {
        const membership = await this.prisma.membership.findFirst({
            where: {
                uid: user.id,
                rid: room.id,
                is_invite: true,
            }
        });
        if (!membership) {
            return (false);
        }
        const newMember = await this.prisma.membership.update({
            where: {
                id: membership.id,
            },
            data: {
                is_invite: false,
            }
        });
        return (true);
    }

    async joinRoom(user: User, roomName: string, roomPassword: string) {
        if (!this.isValidRoomName) {
            throw new ForbiddenException(`Room ${roomName} does not exist`);
        }
        const checkRoom = await this.findRoomByName(roomName);
        if (!checkRoom) {
            throw new ForbiddenException(`Room ${roomName} does not exist`);
        }
        else if (await this.isUserRoom(user, roomName)) {
            throw new ForbiddenException(`You are already in this room`);
        }
        else if (checkRoom.type === 'protected'
            && !(await this.comparePasswords(roomPassword, checkRoom.password))) {
            throw new ForbiddenException(`Wrong password`);
        }
        else if (checkRoom.type === 'private'
            && !(await this.isInvitedPrivate(user, checkRoom))) {
            throw new ForbiddenException(`You have not been invited in this room`);
        } else if (await this.isBannedRoom(user, checkRoom)) {
            throw new ForbiddenException(`You have been banned from this room`);
        }
        try {
            if (checkRoom.type === 'private') {
                const privateRoomJoining = await this.joinPrivateRoom(user, checkRoom);
                if (!privateRoomJoining) {
                    throw new ForbiddenException(`You have not been invited in this room`);
                }
            } else {
                const data = {
                    uid: user.id,
                    rid: checkRoom.id,
                }
                const newMember = await this.prisma.membership.create({
                    data: data,
                });
            }
            return ("Room successfully joined");
        } catch (error) {
            throw new ForbiddenException(error);
        }
    }

    async getUserRoomsName(user: User) {
        try {
            const rooms = await this.prisma.membership.findMany({
                where: {
                    uid: user.id,
                    is_banned: false,
                    is_invite: false,
                },
                select: {
                    room: {
                        select: {
                            name: true,
                            type: true,
                        }
                    }
                },
            });
            const pubRooms = rooms
                .map(membership => membership.room)
                .filter(room => room.type === 'public');
            const privRooms = rooms
                .map(membership => membership.room)
                .filter(room => room.type === 'private');
            const proRooms = rooms
                .map(membership => membership.room)
                .filter(room => room.type === 'protected');
            const res = {
                public: pubRooms,
                private: privRooms,
                protected: proRooms,
            }
            return (res);
        } catch (error) {
            throw new ForbiddenException(error);
        }
    }

    private async removeMessagesFromBlocked(
        user: User,
        messages: {
            createdAt: Date;
            msg: string;
            User: {
                username: string;
                picUrl: string;
            },
        }[]) {
        const blockedUsernames = await this.userService.getAllBlockedUsernames(user);
        if (!blockedUsernames) {
            return (messages);
        }
        const filteredMessages = messages.filter(
            message => !blockedUsernames.includes(message.User.username)
        );
        return (filteredMessages);
    }

    async getMessagesRoom(user: User, roomName: string) {
        if (!await this.isUserRoom(user, roomName)) {
            throw new UnauthorizedException(`${user.username} is not in this room`);
        }
        const room = await this.findRoomByName(roomName);
        if (!room) {
            throw new UnauthorizedException(`Room ${roomName} does not exist`);
        }
        try {
            const messages = await this.prisma.message.findMany({
                where: {
                    roomId: room.id,
                },
                select: {
                    id: true,
                    createdAt: true,
                    msg: true,
                    User: {
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
            const filteredMessages = this.removeMessagesFromBlocked(user, messages);
            return (filteredMessages);
        } catch (error) {
            throw new ForbiddenException(error);
        }
    }

    async getLastMessageRoom(user: User, roomName: string, msg: string) {
        if (!await this.isUserRoom(user, roomName)) {
            return null;
        }
        const room = await this.findRoomByName(roomName);
        if (!room) {
            return null;
        }
        if (await this.isMutedRoom(user, room)) {
            return null;
        }
        const message = await this.prisma.message.findFirst({
            where: {
                userId: user.id,
                roomId: room.id,
                msg: msg,
            },
            select: {
                id: true,
                createdAt: true,
                msg: true,
                User: {
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
    }

    async getMessInviteGameFriend(user: User, room: room) {
        const messInviteGame = await this.prisma.message.findFirst({
            where: {
                userId: user.id,
                roomId: room.id,
                type: 'game',
            },
        });
        return (messInviteGame);
    }

    async createMessage(user: User, roomName: string, msg: string, type: string) {
        if (!await this.isUserRoom(user, roomName)) {
            throw new UnauthorizedException(`${user.username} is not in this room`);
        }
        const room = await this.findRoomByName(roomName);
        if (!room) {
            throw new UnauthorizedException(`Room ${roomName} does not exist`);
        }
        const checkMute = await this.isMutedRoom(user, room);
        if (checkMute) {
            throw new UnauthorizedException(`You have been mute until ${checkMute}`);
        }
        try {
            if (type === 'game') {
                const prevMessInvite = await this.getMessInviteGameFriend(user, room);
                if (prevMessInvite) {
                    await this.prisma.message.update({
                        where: {
                            id: prevMessInvite.id,
                        },
                        data: {
                            createdAt: new Date(),
                        }
                    });
                    return;
                }
            }
            const data = {
                userId: user.id,
                roomId: room.id,
                msg: msg,
                type: type,
            }
            const newMessage = await this.prisma.message.create({
                data: data,
            });
            if (type === 'game') {
                await this.gameService.createGameInviteMess(newMessage.id, user);
            }
        } catch (error) {
            throw new UnauthorizedException(error);
        }
    }

    async getUserMembershipRoom(user: User, roomName: string) {
        if (!await this.isUserRoom(user, roomName)) {
            throw new UnauthorizedException(`${user.username} is not in this room`);
        }
        const room = await this.findRoomByName(roomName);
        if (!room) {
            throw new UnauthorizedException(`Room ${roomName} does not exist`);
        }
        try {
            const membership = this.prisma.membership.findFirst({
                where: {
                    uid: user.id,
                    rid: room.id,
                },
                select: {
                    is_admin: true,
                    is_owner: true,
                    room: {
                        select: {
                            type: true,
                        },
                    },
                }
            });
            return (membership);
        } catch (error) {
            throw new ForbiddenException(error);
        }
    }

    async getUserMembershipRoomFull(user: User, roomName: string) {
        if (!await this.isUserRoom(user, roomName)) {
            throw new UnauthorizedException(`${user.username} is not in this room`);
        }
        const room = await this.findRoomByName(roomName);
        if (!room) {
            throw new UnauthorizedException(`Room ${roomName} does not exist`);
        }
        try {
            const membership = this.prisma.membership.findFirst({
                where: {
                    uid: user.id,
                    rid: room.id,
                },
            });
            return (membership);
        } catch (error) {
            throw new ForbiddenException(error);
        }
    }

    async removeInvitePrivateRoom(roomId: string) {
        await this.prisma.membership.deleteMany({
            where: {
                rid: roomId,
                is_invite: true,
            }
        });
    }

    async changePasswordRoom(user: User, roomName: string, newPassword: string) {
        const checkMember = await this.getUserMembershipRoom(user, roomName);
        if (!checkMember || !checkMember.is_owner) {
            throw new UnauthorizedException("You cannot change the password");
        }
        const room = await this.findRoomByName(roomName);
        if (!room) {
            throw new UnauthorizedException(`Room ${roomName} does not exist`);
        }
        this.isValidPassword(newPassword);
        try {
            await this.removeInvitePrivateRoom(room.id);
            await this.prisma.room.update({
                where: {
                    id: room.id,
                },
                data: {
                    type: 'protected',
                    password: await this.hashPassword(newPassword),
                }
            });
            return ('New password set!');
        } catch (error) {
            throw new ForbiddenException(error);
        }
    }

    async deletePasswordRoom(user: User, roomName: string) {
        const checkMember = await this.getUserMembershipRoom(user, roomName);
        if (!checkMember || !checkMember.is_owner) {
            throw new UnauthorizedException("You cannot delete the password");
        }
        const room = await this.findRoomByName(roomName);
        if (!room) {
            throw new UnauthorizedException(`Room ${roomName} does not exist`);
        }
        try {
            await this.prisma.room.update({
                where: {
                    id: room.id,
                },
                data: {
                    type: 'public',
                    password: '',
                }
            });
            return ('Pasword removed!');
        } catch (error) {
            throw new ForbiddenException(error);
        }
    }

    async addAdminRoom(user: User, roomName: string, newAdminUsername: string) {
        const checkMember = await this.getUserMembershipRoom(user, roomName);
        if (!checkMember || !checkMember.is_owner) {
            throw new UnauthorizedException("You cannot add admin");
        }
        const room = await this.findRoomByName(roomName);
        if (!room) {
            throw new UnauthorizedException(`Room ${roomName} does not exist`);
        }
        const newAdminUser = await this.userService.findUserByUsername(newAdminUsername);
        if (!newAdminUser) {
            throw new UnauthorizedException(`${newAdminUsername} does not exist`);
        }
        const memberNewAdmin = await this.getUserMembershipRoomFull(newAdminUser, roomName);
        if (!memberNewAdmin) {
            throw new UnauthorizedException(`${newAdminUsername} is not in room ${roomName}`);
        } else if (memberNewAdmin.is_admin) {
            throw new UnauthorizedException(`${newAdminUsername} is already admin`);
        }
        try {
            await this.prisma.membership.update({
                where: {
                    id: memberNewAdmin.id,
                },
                data: {
                    is_admin: true,
                }
            });
            return ("New admin added successfully");
        } catch (error) {
            throw new ForbiddenException(error);
        }
    }

    async leaveRoom(user: User, roomName: string) {
        const room = await this.findRoomByName(roomName);
        if (!room) {
            throw new UnauthorizedException(`Room ${roomName} does not exist`);
        }
        const checkMember = await this.getUserMembershipRoomFull(user, roomName);
        if (!checkMember) {
            throw new UnauthorizedException("You are not in this room");
        }
        try {
            await this.prisma.membership.delete({
                where: {
                    id: checkMember.id,
                },
            })
            return (`You left room ${roomName}`);
        } catch (error) {
            throw new ForbiddenException(error);
        }
    }

    async kickUserRoom(user: User, roomName: string, toKickUsername: string) {
        const checkMember = await this.getUserMembershipRoom(user, roomName);
        if (!checkMember || !checkMember.is_admin) {
            throw new UnauthorizedException("You cannot kick");
        }
        const room = await this.findRoomByName(roomName);
        if (!room) {
            throw new UnauthorizedException(`Room ${roomName} does not exist`);
        }
        const newKickUser = await this.userService.findUserByUsername(toKickUsername);
        if (!newKickUser) {
            throw new UnauthorizedException(`${toKickUsername} does not exist`);
        }
        const memberkick = await this.getUserMembershipRoomFull(newKickUser, roomName);
        if (!memberkick) {
            throw new UnauthorizedException(`${toKickUsername} is not in room ${roomName}`);
        } else if (memberkick.is_owner) {
            throw new UnauthorizedException(`You cannot kick the owner`);
        }
        try {
            await this.prisma.membership.delete({
                where: {
                    id: memberkick.id,
                },
            })
            return (`${toKickUsername} has been kicked`)
        } catch (error) {
            throw new ForbiddenException(error);
        }
    }

    async banUserRoom(user: User, roomName: string, toBanUsername: string) {
        const checkMember = await this.getUserMembershipRoom(user, roomName);
        if (!checkMember || !checkMember.is_admin) {
            throw new UnauthorizedException("You cannot ban");
        }
        const room = await this.findRoomByName(roomName);
        if (!room) {
            throw new UnauthorizedException(`Room ${roomName} does not exist`);
        }
        const newBanUser = await this.userService.findUserByUsername(toBanUsername);
        if (!newBanUser) {
            throw new UnauthorizedException(`${toBanUsername} does not exist`);
        }
        const memberban = await this.getUserMembershipRoomFull(newBanUser, roomName);
        if (!memberban) {
            throw new UnauthorizedException(`${toBanUsername} is not in room ${roomName}`);
        } else if (memberban.is_owner) {
            throw new UnauthorizedException(`You cannot ban the owner`);
        }
        try {
            await this.prisma.membership.update({
                where: {
                    id: memberban.id,
                },
                data: {
                    is_admin: false,
                    is_banned: true,
                }
            })
            return (`${toBanUsername} has been banned`)
        } catch (error) {
            throw new ForbiddenException(error);
        }
    }

    async muteUserRoom(user: User, roomName: string, toMuteUsername: string, end: Date) {
        const checkMember = await this.getUserMembershipRoom(user, roomName);
        if (!checkMember || !checkMember.is_admin) {
            throw new UnauthorizedException("You cannot mute");
        }
        const room = await this.findRoomByName(roomName);
        if (!room) {
            throw new UnauthorizedException(`Room ${roomName} does not exist`);
        }
        const newMuteUser = await this.userService.findUserByUsername(toMuteUsername);
        if (!newMuteUser) {
            throw new UnauthorizedException(`${toMuteUsername} does not exist`);
        }
        const membermute = await this.getUserMembershipRoomFull(newMuteUser, roomName);
        if (!membermute) {
            throw new UnauthorizedException(`${toMuteUsername} is not in room ${roomName}`);
        } else if (membermute.is_owner) {
            throw new UnauthorizedException(`You cannot mute the owner`);
        }
        const timeNow = new Date();
        const objEnd = new Date(end);
        if (objEnd < timeNow) {
            throw new UnauthorizedException(`Incorect end for mute`);
        }
        try {
            await this.prisma.membership.update({
                where: {
                    id: membermute.id,
                },
                data: {
                    is_muted: true,
                    mute_at: timeNow,
                    duration: objEnd,
                }
            })
            return (`${toMuteUsername} has been muted`);
        } catch (error) {
            throw new ForbiddenException(error);
        }
    }

    async deleteMessage(messageId: string) {
        await this.prisma.message.delete({
            where: {
                id: messageId,
            }
        });
    }

    async wsJoinRoom(client: Socket, roomName: string) {
        await client.join(roomName);
    }
}
