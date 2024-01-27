'use client'

import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useRef, useState } from "react";
import PrivMessageItem from "./PrivMessageItem";
import PrivInviteItem from "./PrivInviteItem";
import { privSocket } from "@/sockets/privSocket";
import { useRouter } from "next/navigation";

export default function PrivMessagesArea({ friendUsername, prevMess }:
    {
        friendUsername: string,
        prevMess: IPrivMessages[],
    }) {
    const [isConnected, setIsConnected] = useState(privSocket.connected);
    const [messages, setMessages] = useState<IPrivMessages[]>(prevMess);
    const scrollRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        function onConnect() {
            setIsConnected(true);
            privSocket.emit("join", { friendName: friendUsername });
        }

        function onDisconnect() {
            setIsConnected(false)
        }

        function onNewMessage(newMessage: IPrivMessages) {
            setMessages(messages => [...messages, newMessage]);
        }

        function onGameStart() {
            router.replace("/game");
        }

        privSocket.on('connect', onConnect);
        privSocket.on('disconnect', onDisconnect);
        privSocket.on('newMessage', onNewMessage);
        privSocket.on('game_start', onGameStart);

        if (privSocket.connected) {
            onConnect();
        } else {
            privSocket.connect();
        }


        return () => {
            privSocket.off('connect', onConnect);
            privSocket.off('disconnect', onDisconnect);
            privSocket.off('newMessage', onNewMessage);
            privSocket.off('game_start', onGameStart);

            privSocket.disconnect();
        };
    }, [router, friendUsername]);

    useEffect(() => {
        setMessages(prevMess);
    }, [prevMess]);

    useEffect(() => {
        const lastMessageElement = document.getElementById("last-message");
        if (lastMessageElement) {
            lastMessageElement.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    return (
        <ScrollArea className="h-[450px] w-full rounded-md border p-4" ref={scrollRef}>
            <div className="flex flex-col w-full">
                {messages && messages.map((message, i) => (
                    message.type === 'msg' ?
                        <PrivMessageItem key={i} message={message} id={i === messages.length - 1 ? "last-message" : "undefined"} />
                        : <PrivInviteItem key={i}
                            message={message}
                            id={i === messages.length - 1 ? "last-message" : "undefined"}
                        />
                ))}
            </div>
        </ScrollArea>
    );
}