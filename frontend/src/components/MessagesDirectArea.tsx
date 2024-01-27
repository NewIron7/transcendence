'use client'

import {
    Card,
    CardContent,
} from "@/components/ui/card"
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "./ui/use-toast";
import PrivMessagesArea from "./PrivMessagesArea";
import PrivMessageInput from "./PrivMessageInput";

export default function MessagesDirectArea({ friendUsername }: { friendUsername: string }) {
    const [messages, setMessages] = useState<IPrivMessages[]>([]);
    

    useEffect(() => {
        const getMessages = async () => {
            const url = process.env.NEXT_PUBLIC_BACKEND_DIRECT;
            if (!url)
                throw new Error('NEXT_PUBLIC_BACKEND_DIRECT is not defined in the environment variables.');

            return await axios.get(url, {
                params: {
                    username: friendUsername,
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
    }, [friendUsername]);

    return (
        <Card className="w-full ">
            <CardContent>
                <PrivMessagesArea
                    friendUsername={friendUsername}
                    prevMess={messages}
                />
                <PrivMessageInput friendUsername={friendUsername} />
            </CardContent>
        </Card>
    );
}