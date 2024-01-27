'use client'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Dispatch, SetStateAction, useState } from "react";

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { toast } from "./ui/use-toast";
import axios from "axios";

interface IRoomInfoName {
    name: string,
    type: string,
}

interface IRooms {
    private: Array<IRoomInfoName>,
    public: Array<IRoomInfoName>,
    protected: Array<IRoomInfoName>,
}

export default function CreateRoom({ setRoom, rooms, setRooms }: {
    setRoom: Dispatch<SetStateAction<string>>
    setRooms: Dispatch<SetStateAction<IRooms>>,
    rooms: IRooms | undefined,
}) {
    const [name, setName] = useState("");
    const [type, setType] = useState("");
    const [password, setPassword] = useState("");

    async function createRoomBackend() {
        const url = process.env.NEXT_PUBLIC_BACKEND_ROOM;
        if (!url)
            throw new Error('NEXT_PUBLIC_BACKEND_ROOM is not defined in the environment variables.');
        await axios.post(url,
            {
                name: name,
                type: type,
                password: password,
            },
            {
                withCredentials: true,
            })
            .then(res => {
                toast({
                    title: res.data,
                })
                setRoom(name);
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
        if (!name || !type) {
            toast({
                title: "Empty field",
                description: "You have to provide a name and a type for the room",
                variant: "destructive",
            })
            return;
        }
        else if (type === 'protected' && !password) {
            toast({
                title: "Empty password",
                description: "You have to provide a password for protected rooms",
                variant: "destructive",
            })
            return;
        }
        createRoomBackend();
        setName("");
        setType("");
        setPassword("");
    }


    return (
        <Card className="h-min">
            <CardHeader>
                <CardTitle>Create room</CardTitle>
            </CardHeader>
            <CardContent>
                <div>
                    <span>Room&apos;s name</span>
                    <Input type="text" id="name" placeholder="Default" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                    <span>Room&apos;s type</span>
                    <Select onValueChange={setType} defaultValue="" value={type}>
                        <SelectTrigger className="">
                            <SelectValue placeholder="Select a room's type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="public">public</SelectItem>
                            <SelectItem value="private">private</SelectItem>
                            <SelectItem value="protected">protected</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {type === 'protected' &&
                    <div>
                        <Label htmlFor="password">Room&apos;s password</Label>
                        <Input type="password" id="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                }
                <Button className="mt-2" onClick={onSubmit}>Create</Button>
            </CardContent>
        </Card>


    );
}