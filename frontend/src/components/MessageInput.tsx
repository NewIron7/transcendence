'use client'

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import axios from "axios";
import { toast } from "./ui/use-toast";
import { io } from "socket.io-client";
import { useRouter } from "next/navigation";
import { Sword } from "lucide-react";
import { roomSocket } from "@/sockets/roomSocket";

export default function MessageInput({ roomName }: { roomName: string }) {
    const [messsage, setMessage] = useState("");
    const router = useRouter();

    async function sendMessageBackend(type: string, msg: string) {
        const url = process.env.NEXT_PUBLIC_BACKEND_ROOM_MESSAGE;
        if (!url)
            throw new Error('NEXT_PUBLIC_BACKEND_ROOM_MESSAGE is not defined in the environment variables.');
        await axios.post(url,
            {
                msg: msg,
                type: type,
            },
            {
                params: {
                    name: roomName,
                },
                withCredentials: true,
            })
            .catch(error => {
                toast({
                    title: "Uh oh! Something went wrong.",
                    description: error?.response?.data?.message?.message,
                    variant: "destructive",
                })
            });
    }

    async function onSend(event: any) {
        event.preventDefault();

        if (!messsage) {
            return;
        }
        await sendMessageBackend('msg', messsage);
        roomSocket.emit('newMessage', {
            roomName: roomName,
            msg: messsage,
        })
        setMessage("");
    }

    async function onSendGame() {
        const nMess = messsage ? messsage : "Wanna play ?";
        await sendMessageBackend('game', nMess);
        roomSocket.emit('newMessage', {
            roomName: roomName,
            msg: nMess,
        })
        setMessage("");
    }

    return (
        <div className="flex w-full">
            <form className="flex w-full items-center space-x-2" onSubmit={onSend}>
                <Input type="text" placeholder="Message" value={messsage} onChange={e => setMessage(e.target.value)} />
                <Button type="submit">Send</Button>
            </form>
            <Button onClick={onSendGame} variant="secondary" className="ml-1">
                <Sword />
            </Button>
        </div>

    );
}