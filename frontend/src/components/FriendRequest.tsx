'use client'

import {
    Card,
    CardContent,
    CardFooter,
} from "@/components/ui/card"
import { Avatar, AvatarImage } from "./ui/avatar";
import { Butcherman } from "next/font/google";
import { Button } from "./ui/button";
import axios from "axios";
import { toast } from "./ui/use-toast";
import { useState } from "react";

export default function FriendRequest(props: any) {
    const [res, setRes] = useState(false);
    const request = props.request;

    function formatReadableDate(dateString: string) {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            timeZoneName: 'short'
        });
    }

    async function cancelFriendAction() {
        const url = process.env.NEXT_PUBLIC_BACKEND_FRIENDS_REQUEST;
        if (!url)
            throw new Error('NEXT_PUBLIC_BACKEND_FRIENDS_REQUEST is not defined in the environment variables.');
        await axios.post(url + '-decline/' + request.sender.username, {}, {
            withCredentials: true,
        })
            .then(res => {
                toast({
                    title: res.data,
                })
                setRes(true);
            })
            .catch(error => {
                toast({
                    title: "Uh oh! Something went wrong.",
                    description: error?.response?.data?.message?.message,
                    variant: "destructive",
                })
            });
    }

    async function acceptFriendAction() {
        const url = process.env.NEXT_PUBLIC_BACKEND_FRIENDS_REQUEST;
        if (!url)
            throw new Error('NEXT_PUBLIC_BACKEND_FRIENDS_REQUEST is not defined in the environment variables.');
        await axios.post(url + '-accept/' + request.sender.username, {}, {
            withCredentials: true,
        })
            .then(res => {
                toast({
                    title: res.data,
                })
                setRes(true);
            })
            .catch(error => {
                toast({
                    title: "Uh oh! Something went wrong.",
                    description: error?.response?.data?.message?.message,
                    variant: "destructive",
                })
            });
    }

    return (
        <>
            {res ? <></>
                : <Card className="">
                    <CardContent className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Avatar className="m-2">
                                <AvatarImage src={request.sender.picUrl || process.env.NEXT_PUBLIC_BACKEND_AVATARS_DEFAULT} />
                            </Avatar>
                            <p>{request.sender.username}</p>
                        </div>
                        <div className="flex items-center ml-2">
                            <Button variant="secondary" className="bg-lime-600 mr-1" onClick={acceptFriendAction}>Accept</Button>
                            <Button variant="secondary" className="bg-red-700" onClick={cancelFriendAction}>Decline</Button>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <p>{formatReadableDate(request.createdAt)}</p>
                    </CardFooter>
                </Card>
            }
        </>



    );
}