'use client'

import FindPlayer from "@/components/FindPlayer";
import FriendRequests from "@/components/FriendRequests";
import ProfileCardPreview from "@/components/ProfileCardPreview";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Friends() {
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
        <div className="flex">
            <FriendRequests />
            <div className="flex flex-col items-center p-3">
                <h1 className="font-bold text-xl">
                    Friends
                </h1>
                <FindPlayer />
                <div className="flex items-center justify-center flex-wrap p-3">
                    {friends.map((friend, i) => (
                        <ProfileCardPreview key={i} friend={friend} />
                    ))}
                </div>

            </div>
        </div>
    );
}