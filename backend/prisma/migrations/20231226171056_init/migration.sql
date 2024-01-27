-- CreateTable
CREATE TABLE "User" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL,
    "fyId" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "picUrl" TEXT NOT NULL DEFAULT 'https://img.freepik.com/free-vector/illustration-businessman_53876-5856.jpg?w=740&t=st=1702312039~exp=1702312639~hmac=0d3674ad8916b34057eafe737fef7b896279e513b51bb451c3958252f8b72c52',
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'offline',
    "twofactor" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorAuthenticationSecret" TEXT NOT NULL DEFAULT '',
    "twofactorState" TEXT NOT NULL DEFAULT '',
    "Wins" INTEGER NOT NULL DEFAULT 0,
    "Losses" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER NOT NULL DEFAULT 0,
    "xp" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friendrequest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',

    CONSTRAINT "friendrequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membership" (
    "id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "rid" TEXT NOT NULL,
    "is_owner" BOOLEAN NOT NULL DEFAULT false,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "is_banned" BOOLEAN NOT NULL DEFAULT false,
    "is_muted" BOOLEAN NOT NULL DEFAULT false,
    "mute_at" TIMESTAMP(3),
    "duration" TIMESTAMP(3),
    "is_invite" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'public',
    "password" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "msg" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'msg',

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "directMessage" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "msg" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'msg',

    CONSTRAINT "directMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "currentGame" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createrId" TEXT NOT NULL,
    "createrScore" INTEGER NOT NULL DEFAULT 0,
    "invitedId" TEXT,
    "invitedScore" INTEGER NOT NULL DEFAULT 0,
    "winScore" INTEGER NOT NULL DEFAULT 10,

    CONSTRAINT "currentGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "winnerId" TEXT NOT NULL,
    "winnerScore" INTEGER NOT NULL DEFAULT 0,
    "loserId" TEXT NOT NULL,
    "loserScore" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inviteGame" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createrId" TEXT NOT NULL,
    "createrJoined" BOOLEAN NOT NULL DEFAULT false,
    "invitedId" TEXT,
    "invitedJoined" BOOLEAN NOT NULL DEFAULT false,
    "directMessageId" TEXT,
    "messageId" TEXT,

    CONSTRAINT "inviteGame_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_fyId_key" ON "User"("fyId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "friendrequest_id_key" ON "friendrequest"("id");

-- CreateIndex
CREATE UNIQUE INDEX "friendrequest_senderId_receiverId_key" ON "friendrequest"("senderId", "receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "membership_uid_rid_key" ON "membership"("uid", "rid");

-- CreateIndex
CREATE UNIQUE INDEX "room_name_key" ON "room"("name");

-- CreateIndex
CREATE UNIQUE INDEX "currentGame_id_key" ON "currentGame"("id");

-- CreateIndex
CREATE UNIQUE INDEX "game_id_key" ON "game"("id");

-- CreateIndex
CREATE UNIQUE INDEX "inviteGame_directMessageId_key" ON "inviteGame"("directMessageId");

-- CreateIndex
CREATE UNIQUE INDEX "inviteGame_messageId_key" ON "inviteGame"("messageId");

-- AddForeignKey
ALTER TABLE "friendrequest" ADD CONSTRAINT "friendrequest_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendrequest" ADD CONSTRAINT "friendrequest_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership" ADD CONSTRAINT "membership_uid_fkey" FOREIGN KEY ("uid") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership" ADD CONSTRAINT "membership_rid_fkey" FOREIGN KEY ("rid") REFERENCES "room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "directMessage" ADD CONSTRAINT "directMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "directMessage" ADD CONSTRAINT "directMessage_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "currentGame" ADD CONSTRAINT "currentGame_createrId_fkey" FOREIGN KEY ("createrId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "currentGame" ADD CONSTRAINT "currentGame_invitedId_fkey" FOREIGN KEY ("invitedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game" ADD CONSTRAINT "game_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game" ADD CONSTRAINT "game_loserId_fkey" FOREIGN KEY ("loserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inviteGame" ADD CONSTRAINT "inviteGame_createrId_fkey" FOREIGN KEY ("createrId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inviteGame" ADD CONSTRAINT "inviteGame_invitedId_fkey" FOREIGN KEY ("invitedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inviteGame" ADD CONSTRAINT "inviteGame_directMessageId_fkey" FOREIGN KEY ("directMessageId") REFERENCES "directMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inviteGame" ADD CONSTRAINT "inviteGame_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
