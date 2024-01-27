'use client'

import { ScrollArea } from "@/components/ui/scroll-area"
import ElemMatchHistory from "./ElemMatchHistory";
import { useEffect, useRef, useState } from "react";
import { IGameHistory } from "@/types/IGameHistory";
import axios from "axios";
import { toast } from "./ui/use-toast";
import { IUser } from "@/types/IUser";
import ElemLeaderboard from "./ElemLeaderboard";

export default function Leaderboard() {
    const [learderboard, setLeaderboard] = useState<IUser[]>([]);

    useEffect(() => {

        async function getLeaderboard() {
            const url = process.env.NEXT_PUBLIC_BACKEND_LEADERBOARD;
            if (!url)
                throw new Error('NEXT_PUBLIC_BACKEND_LEADERBOARD is not defined in the environment variables.');

            return await axios.get(url, {
                withCredentials: true,
            })
                .then(res => {
                    setLeaderboard(res.data);
                })
                .catch(error => {
                    toast({
                        title: "Uh oh! Something went wrong.",
                        description: "Error while fetching user data" + error?.response?.data?.message?.message,
                        variant: "destructive",
                    })
                });
        }

        getLeaderboard();

    }, []);


    return (
        <div className="flex-auto flex mt-3">
            {
                learderboard && learderboard.length > 0 &&
                <div className="flex flex-col h-[500px] items-center font-bold text-lg">
                    <h1>Leaderboard</h1>
                    <ScrollArea className="rounded-md border pt-2">
                        {learderboard.map((user, i) =>
                            <ElemLeaderboard user={user} pos={i} key={i} />
                        )
                        }
                    </ScrollArea>
                </div>
            }
        </div>

    );
}