'use client'

import { ScrollArea } from "@/components/ui/scroll-area"
import ElemMatchHistory from "./ElemMatchHistory";
import { useEffect, useRef, useState } from "react";
import { IGameHistory } from "@/types/IGameHistory";
import axios from "axios";
import { toast } from "./ui/use-toast";

export default function MatchHistory() {
    const [gameHistory, setGameHistory] = useState<IGameHistory[]>([]);
    const usernameRef = useRef<string>("");

    useEffect(() => {

        async function getGameHistory() {
            const url = process.env.NEXT_PUBLIC_BACKEND_GAME_HISTORY;
            if (!url)
                throw new Error('NEXT_PUBLIC_BACKEND_GAME_HISTORY is not defined in the environment variables.');

            return await axios.get(url, {
                withCredentials: true,
            })
                .then(res => {
                    const data: { username: string, gameHistory: IGameHistory[] } = res.data;
                    setGameHistory(data.gameHistory);
                    usernameRef.current = data.username;
                })
                .catch(error => {
                    toast({
                        title: "Uh oh! Something went wrong.",
                        description: "Error while fetching user data" + error?.response?.data?.message?.message,
                        variant: "destructive",
                    })
                });
        }

        getGameHistory();

    }, []);


    return (
        <div className="flex-auto flex mt-3 h-[400px] justify-center">
            {
                gameHistory && gameHistory.length > 0 &&
                <div className="flex flex-col items-center font-bold text-lg">
                    <h1>Match history</h1>
                    <ScrollArea className="w-fit rounded border p-4 mt-1 mr-4 ml-4">
                        {gameHistory.map((match, i) =>
                            <ElemMatchHistory match={match} username={usernameRef.current} key={i} />
                        )
                        }
                    </ScrollArea>
                </div>
            }
        </div>

    );
}