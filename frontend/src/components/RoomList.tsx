'use client'

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "./ui/use-toast";
import axios from "axios";
import { BookCheck, BookLock, BookUser } from "lucide-react";

interface IRoomInfoName {
    name: string,
    type: string,
}

interface IRooms {
    private: Array<IRoomInfoName>,
    public: Array<IRoomInfoName>,
    protected: Array<IRoomInfoName>,
}

export default function RoomList({ setRoom, room, rooms, setRooms }: {
    setRoom: Dispatch<SetStateAction<string>>
    room: string,
    setRooms: Dispatch<SetStateAction<IRooms>>,
    rooms: IRooms | undefined,
}) {

    useEffect(() => {
        const getUserRooms = async () => {

            const url = process.env.NEXT_PUBLIC_BACKEND_ROOM_NAME;
            if (!url)
                throw new Error('NEXT_PUBLIC_BACKEND_ROOM_NAME is not defined in the environment variables.');

            return await axios.get(url, {
                withCredentials: true,
            })
                .then(res => {
                    setRooms(res.data);
                })
                .catch(error => {
                    toast({
                        title: "Uh oh! Something went wrong.",
                        description: error?.response?.data?.message?.message,
                        variant: "destructive",
                    })
                });
        }

        getUserRooms();
    }, [setRooms, room]);


    return (
        <Card className="h-min">
            <CardHeader>
                <CardTitle>Room list</CardTitle>
            </CardHeader>
            <CardContent>
                <Select onValueChange={setRoom} defaultValue="">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Chose a room" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel className="flex"><BookUser />Private</SelectLabel>
                            {rooms && rooms.private.map((r, i) =>
                                r.type === 'private' && (
                                    <SelectItem key={i} value={r.name}>{r.name}</SelectItem>
                                ))}
                        </SelectGroup>
                        <SelectGroup>
                            <SelectLabel className="flex"><BookLock />Protected</SelectLabel>
                            {rooms && rooms.protected.map((r, i) =>
                                r.type === 'protected' && (
                                    <SelectItem key={i} value={r.name}>{r.name}</SelectItem>
                                ))}
                        </SelectGroup>
                        <SelectGroup>
                            <SelectLabel className="flex"><BookCheck />Public</SelectLabel>
                            {rooms && rooms.public.map((r, i) =>
                                r.type === 'public' && (
                                    <SelectItem key={i} value={r.name}>{r.name}</SelectItem>
                                ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </CardContent>
        </Card>


    );
}