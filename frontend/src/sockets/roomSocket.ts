import { io } from "socket.io-client";

const roomSocketUrl = process.env.NEXT_PUBLIC_BACKEND_CHAT_SOCKET || "";

export const roomSocket = io(roomSocketUrl, {
    autoConnect: false,
    withCredentials: true,
});