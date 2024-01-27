'use client'

import { useEffect } from "react";
import { io } from "socket.io-client";

export default function SetOnlineStatus({
    children,
}: {
    children: React.ReactNode
}) {

    useEffect(() => {
        const url = process.env.NEXT_PUBLIC_BACKEND_STATUS_SOCKET || "";
        const socket = io(url, { withCredentials: true });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <>
            {children}
        </>
    )
}