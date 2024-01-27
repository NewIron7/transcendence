import { gameSocket } from "@/sockets/gameSocket";
import { Button } from "./ui/button";
import { Dispatch, SetStateAction } from "react";
import { ICurrentGame } from "@/types/ICurrentGame";

export default function GameConnectionManager({
    setIsStarted, 
    setCurrentGame,
    currentGame,
    isStarted
}:
{
    setIsStarted: Dispatch<SetStateAction<boolean>>,
    setCurrentGame: Dispatch<SetStateAction<ICurrentGame | undefined>>,
    currentGame: ICurrentGame | undefined,
    isStarted: boolean,
}) {

    function leaveGame() {
        setIsStarted(false);
        setCurrentGame(undefined);
        if (currentGame) {
            gameSocket.emit('leave_game', {currentGameId: currentGame.id});
        }
    }

    return (
        <>
            <Button onClick={leaveGame} variant="destructive">Leave game</Button>
        </>
    );
}