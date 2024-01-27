import { io } from "socket.io-client";

const gameSocketUrl = process.env.NEXT_PUBLIC_BACKEND_GAME_SOCKET || "";

export const gameSocket = io(gameSocketUrl, {
    autoConnect: false,
    withCredentials: true,
});