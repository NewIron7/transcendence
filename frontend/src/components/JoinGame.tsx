import { gameSocket } from "@/sockets/gameSocket";
import { Dispatch, SetStateAction, useState } from "react";
import { Button } from "./ui/button";
import { ICurrentGame } from "@/types/ICurrentGame";

export default function JoinGame({setCurrentGame}:{
    setCurrentGame: Dispatch<SetStateAction<ICurrentGame | undefined>>,
}) {

    function onJoinGame() {
        gameSocket.emit('join_game', (newCurrentGame: ICurrentGame) => {
            setCurrentGame(newCurrentGame);
        });
    }


    return (
        <>
            <Button onClick={onJoinGame}>Join game</Button>
        </>

    );
}