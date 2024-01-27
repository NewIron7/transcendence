'use client'

import {
    Card,
    CardContent,
} from "@/components/ui/card"

import axios from "axios";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "./ui/use-toast";
import MessageInput from "./MessageInput";
import MessagesArea from "./MessagesArea";
import { IMessages } from "@/types/IMessages";

export default function ChatArea({ room, setRoom }: { room: string, setRoom: Dispatch<SetStateAction<string>> }) {
    const [messages, setMessages] = useState<IMessages[]>([]);


    useEffect(() => {
        const getMessages = async () => {
            const url = process.env.NEXT_PUBLIC_BACKEND_ROOM_MESSAGES;
            if (!url)
                throw new Error('NEXT_PUBLIC_BACKEND_ROOM_MESSAGES is not defined in the environment variables.');

            return await axios.get(url, {
                params: {
                    name: room,
                },
                withCredentials: true,
            })
                .then(res => {
                    setMessages(res.data);
                })
                .catch(error => {
                    toast({
                        title: "Uh oh! Something went wrong.",
                        description: error?.response?.data?.message?.message,
                        variant: "destructive",
                    })
                });
        }

        getMessages();
    }, [room]);

    return (
        <Card className="w-full h-6/7">
            <CardContent>
                <MessagesArea
                    room={room}
                    setRoom={setRoom}
                    prevMess={messages}
                />
                <MessageInput roomName={room} />
            </CardContent>
        </Card>
    );
}