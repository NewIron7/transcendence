'use client'

import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarImage } from "./ui/avatar";
import { Swords } from "lucide-react";
import { IUser } from "@/types/IUser";
import Link from "next/link";
import { Badge } from "./ui/badge";

export default function ElemLeaderboard({ user, pos }: {
    user: IUser,
    pos: number,
}) {

    return (
        <div className={`flex flex-col items-center`}>
            <div className={`flex items-center rounded-md font-bold p-1 ${pos === 0 ? 'bg-amber-500' : pos === 1 ? 'bg-gray-500' : pos === 2 ? 'bg-amber-700' : ''}`}>
                <div className="flex flex-col items-center">
                    <span className="font-black">{pos + 1}</span>
                    <Badge variant="secondary" className="mt-3 bg-indigo-600/75">{user.xp}xp</Badge>
                </div>

                <Avatar className="m-3">
                    <Link href={process.env.NEXT_PUBLIC_PROFILE + '/' + user.username}>
                        <AvatarImage src={user.picUrl || ""} />
                    </Link>
                </Avatar>

                <span className="m-2">
                    {user.username}
                </span>

            </div>
            <Separator className="m-1" />
        </div>

    );
}