import { io } from "socket.io-client";

const privSocketUrl = process.env.NEXT_PUBLIC_BACKEND_PRIV_SOCKET || "";

export const privSocket = io(privSocketUrl, {
    autoConnect: false,
    withCredentials: true,
});