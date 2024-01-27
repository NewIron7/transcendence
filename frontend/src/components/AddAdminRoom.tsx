'use client'

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import axios from "axios";
import { toast } from "./ui/use-toast";

export default function AddAdminRoom({ roomName }: { roomName: string }) {
    const [newAdmin, setNewAdmin] = useState("");

    async function addAdminRoom() {
        const url = process.env.NEXT_PUBLIC_BACKEND_ROOM_ADMIN;
        if (!url)
            throw new Error('NEXT_PUBLIC_BACKEND_ROOM_ADMIN is not defined in the environment variables.');
        await axios.post(url,
            {
                username: newAdmin,
            },
            {
                params: {
                    name: roomName,
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

    function onAddAdmin() {
        if (!newAdmin) {
            return ;
        }
        addAdminRoom();
        setNewAdmin("");
    }

    return (
        <div className="mr-2 ml-2">
            <Input type="text" placeholder="new admin"
                value={newAdmin}
                onChange={e => setNewAdmin(e.target.value)} />
            <Button onClick={onAddAdmin} className="mt-1">Add</Button>
        </div>
    );
}