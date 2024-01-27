'use client'

import MessagesDirectArea from "@/components/MessagesDirectArea";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
    Card,
    CardContent,
} from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast";
import { IUser } from "@/types/IUser";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DirectMessages({ params }: {
    params: { username: string, }
}) {
    const username = params.username;
    const [userData, setUserData] = useState<IUser>({
        username: username,
        login: "",
        email: "",
        picUrl: process.env.NEXT_PUBLIC_BACKEND_AVATARS + "default.png",
        Wins: 0,
        Losses: 0,
        status: 'offline',
        xp: 0,
    });

    useEffect(() => {
        const getUserData = async () => {

            const url = process.env.NEXT_PUBLIC_BACKEND_USER_OTHER;
            if (!url)
                throw new Error('NEXT_PUBLIC_BACKEND_USER_OTHER is not defined in the environment variables.');

            return await axios.get(url + username, {
                withCredentials: true,
            })
                .then(res => {
                    setUserData(res.data);
                })
                .catch(error => {
                    toast({
                        title: "Uh oh! Something went wrong.",
                        description: error?.response?.data?.message?.message,
                        variant: "destructive",
                    })
                });
        }


        getUserData();
    }, [username]);

    return (
        <main className="flex flex-col justify-center flex-wrap">
            <Card className="h-min">
                <CardContent className="flex flex-col items-center">
                    <h1 className="font-bold mb-2 mt-1">{userData.username}</h1>
                    <Link href={process.env.NEXT_PUBLIC_PROFILE + '/' + userData.username}>
                        <Avatar className="w-20 h-20">
                            <AvatarImage src={userData.picUrl || process.env.NEXT_PUBLIC_BACKEND_AVATARS_DEFAULT} />
                        </Avatar>
                    </Link>
                </CardContent>
            </Card>
            <MessagesDirectArea friendUsername={userData.username}/>
        </main>
    );
}