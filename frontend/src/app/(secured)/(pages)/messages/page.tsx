'use client'

import ProfileCardPreviewMessage from "@/components/ProfileCardPreviewMessage";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Messages() {
    const [friends, setFriends] = useState([]);

    useEffect(() => {
        const getFriends = async () => {
            const url = process.env.NEXT_PUBLIC_BACKEND_FRIENDS;
            if (!url)
                throw new Error('NEXT_PUBLIC_BACKEND_FRIENDS is not defined in the environment variables.');

            return await axios.get(url, {
                withCredentials: true,
            })
                .then(res => {
                    setFriends(res.data);
                })
                .catch(error => {
                    toast({
                        title: "Uh oh! Something went wrong.",
                        description: error?.response?.data?.message?.message,
                        variant: "destructive",
                    })
                });
        }

        getFriends();
    }, []);

    return (
        <main className="flex flex-col items-center">
            <h1 className="font-bold text-2xl m-3">Messages</h1>
            <div className="flex items-center flex-wrap">
                {friends.map((friend, i) => (
                    <ProfileCardPreviewMessage key={i} friend={friend} />
                ))}
            </div>
        </main>
    );
}