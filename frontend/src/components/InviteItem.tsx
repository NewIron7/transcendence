'use client'

import Link from "next/link";
import { Avatar, AvatarImage } from "./ui/avatar";
import { formatReadableDate } from "@/lib/utils";
import WaitingRoomInvite from "./WaitingRoomInvite";
import { Dispatch, SetStateAction, useState } from "react";
import { IMessages } from "@/types/IMessages";

export default function InviteItem({ message, id }: {
    message:  IMessages,
    id: string,
}) {
    const [inWaiting, setInWaiting] = useState(false);

    return (
        <div className="flex items-center mt-2 w-fit" id={id}>
            <Link href={process.env.NEXT_PUBLIC_PROFILE + '/' + message.User.username}>
                <Avatar className="mr-1">
                    <AvatarImage src={message.User.picUrl} />
                </Avatar>
            </Link>

            <div className="bg-green-900 p-2 rounded-md flex flex-col items-center mr-2 ml-2 text-balance">
                <h1 className="text-bold text-slate-400">{message.User.username}</h1>
                <p className="text-base">
                    {message.msg}
                </p>
                <WaitingRoomInvite messageId={message.id}
                    inWaiting={inWaiting}
                    setInWaiting={setInWaiting}
                />
                <p className="text-slate-400">{formatReadableDate(message.createdAt)}</p>
            </div>
        </div>
    );
}