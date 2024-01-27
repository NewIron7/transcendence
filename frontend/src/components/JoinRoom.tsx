'use client'

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Dispatch, SetStateAction, useState } from "react";
import { join } from "path";
import axios from "axios";
import { toast } from "./ui/use-toast";
import { Label } from "./ui/label";

interface IRoomInfoName {
    name: string,
    type: string,
}

interface IRooms {
    private: Array<IRoomInfoName>,
    public: Array<IRoomInfoName>,
    protected: Array<IRoomInfoName>,
}

export default function JoinRoom({ setRoom, rooms, setRooms }: {
    setRoom: Dispatch<SetStateAction<string>>
    setRooms: Dispatch<SetStateAction<IRooms>>,
    rooms: IRooms | undefined,
}) {
    const [joinRoom, setJoinRoom] = useState("");
    const [joinPassword, setJoinPassword] = useState("");

    async function joinRoomBackend() {
        const url = process.env.NEXT_PUBLIC_BACKEND_ROOM_JOIN;
        if (!url)
            throw new Error('NEXT_PUBLIC_BACKEND_ROOM_JOIN is not defined in the environment variables.');
        await axios.post(url, { password: joinPassword },
            {
                params: {
                    name: joinRoom,
                },
                withCredentials: true,
            })
            .then(res => {
                toast({
                    title: res.data,
                })
                setRoom(joinRoom);
            })
            .catch(error => {
                toast({
                    title: "Uh oh! Something went wrong.",
                    description: error?.response?.data?.message?.message,
                    variant: "destructive",
                })
            });
    }

    function onSubmit() {
        if (!joinRoom) {
            return;
        }
        joinRoomBackend();
        setJoinRoom("");
        setJoinPassword("");
    }

    return (
        <Card className="h-min">
            <CardHeader>
                <CardTitle>Join room</CardTitle>
            </CardHeader>
            <CardContent>
                <Input type="text" placeholder="room's name" value={joinRoom} onChange={e => setJoinRoom(e.target.value)} />
                <span>Provide password for protected room</span>
                <Input type="password" placeholder="password" value={joinPassword}
                    onChange={e => setJoinPassword(e.target.value)} />
                <Button className="mt-2" onClick={onSubmit}>Join</Button>
            </CardContent>
        </Card>
    );
}