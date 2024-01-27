'use client'

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import axios from "axios";
import { toast } from "./ui/use-toast";
import { Label } from "./ui/label";

export default function ChangePasswordRoom({ roomName }: { roomName: string }) {
    const [newPassword, setNewPassword] = useState("");

    async function changePasswordRoomBackend() {
        const url = process.env.NEXT_PUBLIC_BACKEND_ROOM_PASSWORD;
        if (!url)
            throw new Error('NEXT_PUBLIC_BACKEND_ROOM_PASSWORD is not defined in the environment variables.');
        await axios.post(url,
            {
                newPassword: newPassword,
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

    async function deletePasswordRoomBackend() {
        const url = process.env.NEXT_PUBLIC_BACKEND_ROOM_PASSWORD;
        if (!url)
            throw new Error('NEXT_PUBLIC_BACKEND_ROOM_PASSWORD is not defined in the environment variables.');
        await axios.delete(url,
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

    function onChangePassword() {
        if (!newPassword) {
            return;
        }
        changePasswordRoomBackend();
        setNewPassword("");
    }

    function onDeletePassword() {
        deletePasswordRoomBackend();
    }

    return (
        <div className="">
            <Input type="password" placeholder="new password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)} />
            <div className="flex flex-col">
                <Button className="mb-2 mt-1" onClick={onChangePassword}>Change</Button>
                <Label className="pb-2">Delete password (room will become a public room)</Label>
                <Button variant="destructive" onClick={onDeletePassword}>Delete</Button>
            </div>

        </div>
    );
}