'use client'

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import FriendRequest from "./FriendRequest";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "./ui/use-toast";

interface IRequest {
    createdAt: Date,
    status: string,
    sender: {
        username: string,
        picUrl: string,
    },
    receiver: { username: string }
}

export default function FriendRequests() {
    const [friendRequests, setFriendRequests] = useState<IRequest[]>([]);

    useEffect(() => {
        const getRequestUser = async () => {
            const url = process.env.NEXT_PUBLIC_BACKEND_FRIENDS_REQUEST;
            if (!url)
                throw new Error('NEXT_PUBLIC_BACKEND_FRIENDS_REQUEST is not defined in the environment variables.');

            return await axios.get(url, {
                withCredentials: true,
            })
                .then(res => {
                    setFriendRequests(res.data);
                })
                .catch(error => {
                    toast({
                        title: "Uh oh! Something went wrong.",
                        description: error?.response?.data?.message?.message,
                        variant: "destructive",
                    })
                });
        }

        getRequestUser();
    }, []);


    return (
        <Card className="m-3">
            <CardHeader>
                <CardTitle>Friend requests</CardTitle>
                <CardDescription>All your received friend requests</CardDescription>
            </CardHeader>
            <CardContent>
                {friendRequests.map((request, i) =>
                    request.status === 'pending' && (
                        <FriendRequest key={i} request={request} />
                    ))}
            </CardContent>
        </Card>

    );
}