'use client'

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { toast } from "./ui/use-toast";
import Message from "./Message";
import { io } from "socket.io-client";
import axios from "axios";
import LeaveChatButton from "./LeaveChatButton";
import { roomSocket } from "@/sockets/roomSocket";
import { useRouter } from "next/navigation";
import InviteItem from "./InviteItem";
import { IMessages } from "@/types/IMessages";

export default function MessagesArea({ room, setRoom, prevMess }: {
    room: string,
    setRoom: Dispatch<SetStateAction<string>>,
    prevMess: IMessages[],
}) {
    const [isConnected, setIsConnected] = useState(roomSocket.connected);
    const [messages, setMessages] = useState<IMessages[]>(prevMess);
    const blockedUsernames = useRef<string[]>([]);
    const scrollRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        const getAllBlockedUsernames = async () => {
            const url = process.env.NEXT_PUBLIC_BACKEND_BLOCK;
            if (!url)
                throw new Error('NEXT_PUBLIC_BACKEND_BLOCK is not defined in the environment variables.');

            return await axios.get(url, {
                withCredentials: true,
            })
                .then(res => {
                    blockedUsernames.current = res.data;
                })
                .catch(error => {
                    toast({
                        title: "Uh oh! Something went wrong.",
                        description: "Error while fetching user data" + error?.response?.data?.message?.message,
                        variant: "destructive",
                    })
                });
        }

        getAllBlockedUsernames();
    }, [room]);

    useEffect(() => {
        function onConnect() {
            setIsConnected(true);
            roomSocket.emit("joinRoom", { roomName: room });
        }

        function onDisconnect() {
            setIsConnected(false)
        }

        function onNewMessage(newMessage: IMessages) {
            if (!blockedUsernames.current.includes(newMessage.User.username)) {
                setMessages(messages => [...messages, newMessage]);
            }
        }

        function onGameStart() {
            router.replace("/game");
        }

        roomSocket.on('connect', onConnect);
        roomSocket.on('disconnect', onDisconnect);
        roomSocket.on('newMessage', onNewMessage);
        roomSocket.on('game_start', onGameStart);

        if (roomSocket.connected) {
            onConnect();
        } else {
            roomSocket.connect();
        }

        return () => {
            roomSocket.off('connect', onConnect);
            roomSocket.off('disconnect', onDisconnect);
            roomSocket.off('newMessage', onNewMessage);
            roomSocket.off('game_start', onGameStart);

            roomSocket.disconnect();
        };
    }, [router, room]);

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
        <div className="flex flex-col items-center">
            <div className="w-full flex items-center justify-between mt-2 mb-2">
                <h1 className="font-bold text-2xl ml-5">{room}</h1>
                <LeaveChatButton roomName={room} setRoom={setRoom} />
            </div>

            <ScrollArea className="h-[550px] w-full rounded-md border p-4" ref={scrollRef}>
                <div className="flex flex-col w-full">
                    {messages && messages.map((message, i) => (
                        message.type === 'msg' ?
                            <Message key={i} message={message} id={i === messages.length - 1 ? "last-message" : "undefined"} />
                            : <InviteItem key={i}
                                message={message}
                                id={i === messages.length - 1 ? "last-message" : "undefined"}
                            />
                    ))}
                </div>
            </ScrollArea>
        </div>

    );
}