'use client'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { toast } from "./use-toast";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { IUser } from "@/types/IUser";
import { useRouter } from "next/navigation";


export default function ProfileButton() {
    const router = useRouter();

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
                        description: "Error while fetching user data" + error?.response?.data,
                        variant: "destructive",
                    })
                });
        }

        getUserData();

    }, []);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Avatar>
                    <AvatarImage src={userData?.picUrl || ""} />
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                    <Link href="/profile" className="ml-4 lg:ml-0">
                        Profile
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                    <Link href={process.env.NEXT_PUBLIC_FORTYTWO_LOGOUT || "/"} className="ml-4 lg:ml-0">
                        Logout
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
