'use client'

import Link from "next/link";
import { Avatar, AvatarImage } from "./ui/avatar";
import { formatReadableDate } from "@/lib/utils";
import WaitingRoomInvitePriv from "./WaitingRoomInvitePriv";
import { useState } from "react";

export default function PrivInviteItem({ message, id }: {
    message: IPrivMessages,
    id: string,
}) {
    const [inWaiting, setInWaiting] = useState(false);

    return (
        <div className="flex items-center mt-2 w-fit" id={id}>
            <Link href={process.env.NEXT_PUBLIC_PROFILE + '/' + message.sender.username}>
                <Avatar className="mr-1">
                    <AvatarImage src={message.sender.picUrl} />
                </Avatar>
            </Link>

            <div className="bg-green-900 p-2 rounded-md flex flex-col items-center mr-2 ml-2 text-balance">
                <h1 className="text-bold text-slate-400">{message.sender.username}</h1>
                <p className="text-base">
                    {message.msg}
                </p>
                <WaitingRoomInvitePriv messageId={message.id}
                    inWaiting={inWaiting}
                    setInWaiting={setInWaiting}
                />
                <p className="text-slate-400">{formatReadableDate(message.createdAt)}</p>
            </div>
        </div>

    );
}