'use client'

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import axios from "axios";
import { toast } from "./ui/use-toast";

interface IRoomInfoName {
    name: string,
    type: string,
}

interface IRooms {
    private: Array<IRoomInfoName>,
    public: Array<IRoomInfoName>,
    protected: Array<IRoomInfoName>,
}


export default function InvitePrivateRoom({ room, rooms }:
    { room: string, rooms: IRooms | undefined, }) {
    const [isPrivateRoom, setIsPrivateRoom] = useState(false);
    const [toInvite, setToInvite] = useState("");

    useEffect(() => {
        if (rooms) {
            if (rooms.private.some(pr => pr.name == room)) {
                setIsPrivateRoom(true);
            } else {
                setIsPrivateRoom(false);
            }
        } else {
            setIsPrivateRoom(false);
        }

    }, [rooms, room]);

    async function inviteRoomBackend() {
        const url = process.env.NEXT_PUBLIC_BACKEND_ROOM_INVITE;
        if (!url)
            throw new Error('NEXT_PUBLIC_BACKEND_ROOM_INVITE is not defined in the environment variables.');
        await axios.post(url, {  },
            {
                params: {
                    name: room,
                    username: toInvite,
                },
                withCredentials: true,
            })
            .then(res => {
                toast({
                    title: res.data,
                })
            })
            .catch(error => {
                toast({
                    title: "Uh oh! Something went wrong.",
                    description: error?.response?.data?.message?.message,
                    variant: "destructive",
                })
            });
    }

    function onInvite() {
        if (!toInvite) {
            return ;
        }
        inviteRoomBackend();
        setToInvite("");
    }

    return (
        <div className="h-min">
            {isPrivateRoom &&
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Invite people to {room}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Input type="text" placeholder="username"
                            value={toInvite} onChange={e => setToInvite(e.target.value)} />
                        <Button className="m-1" onClick={onInvite}>Invite</Button>
                    </CardContent>
                </Card>
            }
        </div>

    );
}