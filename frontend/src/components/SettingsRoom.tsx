'use client'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "./ui/use-toast";
import { set } from "react-hook-form";
import ChangePasswordRoom from "./ChangePasswordRoom";
import AddAdminRoom from "./AddAdminRoom";
import KickBanMuteUserRoom from "./KickBanMuteUserRoom";
import { Badge } from "./ui/badge";

interface IMembership {
    is_owner: boolean,
    is_admin: boolean,
    room: {
        type: string,
    }
}

export default function SettingsRoom({ roomName }: { roomName: string }) {
    const [isSettings, setIsSettings] = useState(false);
    const [membership, setMembership] = useState<IMembership>()

    useEffect(() => {
        const getMembership = async () => {

            const url = process.env.NEXT_PUBLIC_BACKEND_ROOM_MEMBERSHIP;
            if (!url)
                throw new Error('NEXT_PUBLIC_BACKEND_ROOM_MEMBERSHIP is not defined in the environment variables.');

            return await axios.get(url, {
                params: {
                    name: roomName,
                },
                withCredentials: true,
            })
                .then(res => {
                    setMembership(res.data);
                })
                .catch(error => {
                    toast({
                        title: "Uh oh! Something went wrong.",
                        description: error?.response?.data?.message?.message,
                        variant: "destructive",
                    })
                });
        }

        getMembership();
    }, [roomName]);

    useEffect(() => {
        if (membership) {
            if (membership.is_admin || membership.is_owner) {
                setIsSettings(true);
            } else {
                setIsSettings(false);
            }
        } else {
            setIsSettings(false);
        }
    }, [membership]);

    return (
        <div className="h-min">
            {isSettings && membership && roomName &&
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Settings room
                            <Badge className="ml-2 text-lg pr-2 pl-2 pb-1" variant="outline">
                                {membership.room.type}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap">
                        {membership.is_owner && <ChangePasswordRoom roomName={roomName} />}
                        {membership.is_owner && <AddAdminRoom roomName={roomName}/>}
                        {membership.is_admin && <KickBanMuteUserRoom roomName={roomName}/>}
                    </CardContent>
                </Card>
            }
        </div>


    );
}