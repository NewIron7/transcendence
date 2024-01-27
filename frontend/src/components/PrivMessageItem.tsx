'use client'

import Link from "next/link";
import { Avatar, AvatarImage } from "./ui/avatar";

export default function PrivMessageItem({ message, id }: { message: IPrivMessages, id: string }) {

    function formatReadableDate(date: Date) {
        const nDate = new Date(date);
        const str = nDate.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            timeZoneName: 'short'
        });
        return (str);
    }

    return (
        <div className="flex items-center mt-2 w-fit" id={id}>
            <Link href={process.env.NEXT_PUBLIC_PROFILE + '/' + message.sender.username}>
                <Avatar className="mr-1">
                    <AvatarImage src={message.sender.picUrl} />
                </Avatar>
            </Link>

            <div className="bg-sky-950 p-2 rounded-md w-full flex flex-col items-start mr-2 ml-2 ">
                <h1 className="text-bold text-slate-400">{message.sender.username}</h1>
                <p className="text-base text-wrap break-all">
                    {message.msg}
                </p>
                <p className="text-slate-400">{formatReadableDate(message.createdAt)}</p>
            </div>
        </div>

    );
}