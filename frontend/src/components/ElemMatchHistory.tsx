'use client'

import { Separator } from "@/components/ui/separator"
import { IGameHistory } from "@/types/IGameHistory";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Swords } from "lucide-react";
import Link from "next/link";

export default function ElemMatchHistory({ match, username }: {
    match: IGameHistory,
    username: string,
}) {

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
        <div className={`flex flex-col items-center`}>
            <div className={`flex items-center p-1 rounded-md font-bold ${username === match.winner.username ? 'bg-green-900' : 'bg-red-900'}`}>
                <Avatar className="m-3">
                    {username !== match.winner.username ?
                        <Link href={process.env.NEXT_PUBLIC_PROFILE + '/' + match.winner.username}>
                            <AvatarImage src={match.winner.picUrl || ""} />
                        </Link>
                        :
                        <AvatarImage src={match.winner.picUrl || ""} />
                    }

                </Avatar>
                <span className="m-2">
                    {match.winner.username}
                </span>
                <span>
                    {match.winnerScore}
                </span>
                <Swords className="h-8 w-8 mr-3 ml-3" />
                <span >
                    {match.loserScore}
                </span>
                <span className="m-2">
                    {match.loser.username}
                </span>
                <Avatar className="m-3">
                    {
                        username !== match.loser.username ?
                            <Link href={process.env.NEXT_PUBLIC_PROFILE + '/' + match.loser.username}>
                                <AvatarImage src={match.loser.picUrl || ""} />
                            </Link>
                            :
                            <AvatarImage src={match.loser.picUrl || ""} />
                    }

                </Avatar>
                <span className="font-normal mr-2">
                    {formatReadableDate(match.updatedAt)}
                </span>

            </div>
            <Separator className="m-1" />
        </div>

    );
}