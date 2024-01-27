'use client'

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast";
import { Mail, Medal, PenSquare, Skull, User } from "lucide-react";
import { Badge } from "@/components/ui/badge"
import { FormEmail } from "@/components/FormEmail";
import { FormUsername } from "@/components/FormUsername";
import { FormAvatar } from "@/components/FormAvatar";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useEffect, useReducer, useRef, useState } from "react";
import axios from "axios";
import { IUser } from "@/types/IUser";



export default function Profile() {
    const [userData, setUserData] = useState<IUser>({
        username: "",
        login: "",
        email: "",
        picUrl: process.env.NEXT_PUBLIC_BACKEND_AVATARS + "default.png",
        Wins: 0,
        Losses: 0,
        status: 'offline',
        xp: 0,
    });
    const [isChanged, setIsChanged] = useState<boolean>(false);

    useEffect(() => {
        const getUserData = async () => {

            const url = process.env.NEXT_PUBLIC_BACKEND_USER_ME;
            if (!url)
                throw new Error('NEXT_PUBLIC_BACKEND_USER_ME is not defined in the environment variables.');

            return await axios.get(url, {
                withCredentials: true,
            })
                .then(res => {
                    setUserData(res.data);
                })
                .catch(error => {
                    toast({
                        title: "Uh oh! Something went wrong.",
                        description: "Error while fetching user data" + error?.response?.data?.message?.message,
                        variant: "destructive",
                    })
                });
        }

        getUserData();
        setIsChanged(false);
    }, [isChanged]);


    return (
        <main className="flex flex-col items-center justify-between p-3">
            <Card>
                <CardHeader>
                    <CardTitle>
                        <div className="flex flex-col items-center max-w-full">
                            <div className="flex">
                                <Avatar className="w-40 h-40 m-3">
                                    <AvatarImage src={userData.picUrl} />
                                </Avatar>
                                <Popover>
                                    <PopoverTrigger><PenSquare /></PopoverTrigger>
                                    <PopoverContent><FormAvatar setIsChanged={setIsChanged}/></PopoverContent>
                                </Popover>

                            </div>
                            <div className="flex items-center">
                                <p className="mr-3">{userData.username}</p>
                                <Popover>
                                    <PopoverTrigger><PenSquare /></PopoverTrigger>
                                    <PopoverContent><FormUsername /></PopoverContent>
                                </Popover>

                            </div>
                            <Badge variant="secondary" className="mt-3 bg-indigo-600/75">{userData.xp}xp</Badge>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center mb-3 justify-between">
                        <div className="flex items-center">
                            <User />
                            <div className="ml-5 mr-5">
                                <Badge variant="outline"><p className="text-base">{userData.login}</p></Badge>
                            </div>

                        </div>
                    </div>
                    <div className="flex items-center mb-3 justify-between">
                        <div className="flex items-center">
                            <Mail />
                            <div className="ml-5 mr-5">
                                <Badge variant="outline"><p className="text-base">{userData.email}</p></Badge>
                            </div>
                            <Popover>
                                <PopoverTrigger><PenSquare /></PopoverTrigger>
                                <PopoverContent><FormEmail setIsChanged={setIsChanged}/></PopoverContent>
                            </Popover>
                        </div>

                    </div>
                    <div className="flex items-center mb-3 justify-between">
                        <div className="flex items-center">
                            <Medal />
                            <div className="ml-5 mr-5">
                                <Badge variant="outline"><p className="text-base">{userData.Wins}</p></Badge>
                            </div>

                        </div>
                    </div>
                    <div className="flex items-center mb-3 justify-between">

                        <div className="flex items-center">
                            <Skull />
                            <div className="ml-5 mr-5">
                                <Badge variant="outline"><p className="text-base">{userData.Losses}</p></Badge>
                            </div>

                        </div>
                    </div>
                </CardContent>
            </Card>


        </main>
    )
}
