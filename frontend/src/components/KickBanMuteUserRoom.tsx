'use client'

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import axios from "axios";
import { toast } from "./ui/use-toast";

export default function KickBanMuteUserRoom({ roomName }: { roomName: string }) {
    const [userName, setUserName] = useState("");
    const [endMute, setEndMute] = useState<Date>();

    async function kickUserRoomBackend() {
        const url = process.env.NEXT_PUBLIC_BACKEND_ROOM_KICK;
        if (!url)
            throw new Error('NEXT_PUBLIC_BACKEND_ROOM_KICK is not defined in the environment variables.');
        await axios.post(url,
            {
                username: userName,
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

    async function banUserRoomBackend() {
        const url = process.env.NEXT_PUBLIC_BACKEND_ROOM_BAN;
        if (!url)
            throw new Error('NEXT_PUBLIC_BACKEND_ROOM_BAN is not defined in the environment variables.');
        await axios.post(url,
            {
                username: userName,
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

    async function muteUserRoomBackend() {
        const url = process.env.NEXT_PUBLIC_BACKEND_ROOM_MUTE;
        if (!url)
            throw new Error('NEXT_PUBLIC_BACKEND_ROOM_MUTE is not defined in the environment variables.');
        await axios.post(url,
            {
                username: userName,
                end: endMute,
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

    function onKick() {
        if (!userName) {
            return;
        }
        kickUserRoomBackend();
        setUserName("");
    }

    function onBan() {
        if (!userName) {
            return;
        }
        banUserRoomBackend();
        setUserName("");
    }

    function onMute() {
        if (!userName || !endMute) {
            return;
        }
        muteUserRoomBackend();
        setUserName("");
        setEndMute(undefined);
    }

    return (
        <div>
            <Input type="text" placeholder="username"
                value={userName}
                onChange={e => setUserName(e.target.value)} />
            <Label>Only for mute (end of mute)</Label>
            <Input type="date"
                onChange={e => setEndMute(new Date(e.target.value))} />
            <div className="flex flex-wrap mt-1">
                <Button onClick={onKick}>Kick</Button>
                <Button onClick={onBan} className="mr-1 ml-1">Ban</Button>
                <Button onClick={onMute}>Mute</Button>
            </div>

        </div>
    );
}