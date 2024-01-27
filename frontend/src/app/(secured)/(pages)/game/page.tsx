'use client'

import { ChoseMap } from "@/components/ChoseMap";
import GameConnectionManager from "@/components/GameConnectionManager";
import GameConnectionState from "@/components/GameConnectionState";
import GamePanel from "@/components/GamePanel";
import JoinGame from "@/components/JoinGame";
import MatchHistory from "@/components/MatchHistory";
import { gameSocket } from "@/sockets/gameSocket";
import { ILightGameState, initializeBall, initializeCreater, initializeInvited } from "@/types/IGameElems";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react"

interface ICurrentGame {
  id: string,
  createdAt: Date,
  createrId: string,
  createrScore: number,
  invitedId: string,
  invitedScore: number,
  winScore: number,
  creater: {
    username: string,
    picUrl: string,
    xp: number,
  },
  invited: {
    username: string,
    picUrl: string,
    xp: number,
  },
}

export default function Game() {
  const [isConnected, setIsConnected] = useState(gameSocket.connected);
  const [isStarted, setIsStarted] = useState(false);
  const [currentGame, setCurrentGame] = useState<ICurrentGame>();
  const [gameState, setGameState] = useState<ILightGameState>({
    ball: initializeBall(),
    createrPaddle: initializeCreater(),
    invitedPaddle: initializeInvited(),
  });
  const isCreater = useRef<boolean>(true);
  const mapNumber = useRef<number>(0);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsStarted(false);
      setIsConnected(false);
    }

    function onInGame() {
      gameSocket.emit('join_game', (newCurrentGame: ICurrentGame) => {
        setCurrentGame(newCurrentGame);
      });
    }

    function onStartGame(newCurrentGame: ICurrentGame) {
      setCurrentGame(newCurrentGame);
      setIsStarted(true);
    }

    function onPos(status: boolean) {
      isCreater.current = status;
    }

    function onOpponentLeft() {
      setIsStarted(false);
      setCurrentGame(undefined);
    }

    function onUpdate(newGameState: ILightGameState) {
      setGameState(newGameState);
    }

    function onEndGame() {
      setIsStarted(false);
      setCurrentGame(undefined);
    }


    gameSocket.on('connect', onConnect);
    gameSocket.on('disconnect', onDisconnect);
    gameSocket.on('in_game', onInGame);
    gameSocket.on('start_game', onStartGame);
    gameSocket.on('opponent_left', onOpponentLeft);
    gameSocket.on('update', onUpdate);
    gameSocket.on('pos', onPos);
    gameSocket.on('end_game', onEndGame);

    if (gameSocket.connected) {
      onConnect();
    } else {
      gameSocket.connect();
    }


    return () => {
      gameSocket.off('connect', onConnect);
      gameSocket.off('disconnect', onDisconnect);
      gameSocket.off('in_game', onInGame);
      gameSocket.off('start_game', onStartGame);
      gameSocket.off('opponent_left', onOpponentLeft);
      gameSocket.off('update', onUpdate);
      gameSocket.off('pos', onPos);
      gameSocket.off('end_game', onEndGame);

      gameSocket.disconnect();
    };
  }, []);

  return (
    <main className="flex-auto flex flex-col items-center">
      <div className="flex items-center h-fit">
        <h1 className="font-bold text-2xl m-5">GAME</h1>
        <GameConnectionState isConnected={isConnected} />
      </div>
      <div className="w-full flex justify-around">
        <JoinGame setCurrentGame={setCurrentGame} />

        <GameConnectionManager
          setIsStarted={setIsStarted}
          setCurrentGame={setCurrentGame}
          currentGame={currentGame}
          isStarted={isStarted}
        />
      </div>
      {!currentGame && !isStarted &&
        <div className="flex-auto flex flex-col items-center">
          <ChoseMap mapNumber={mapNumber} />
          <MatchHistory />
        </div>
      }
      {currentGame && !isStarted &&
        <div className="flex flex-col items-center">
          <Loader2 className="h-16 w-16 animate-spin" />
          <p className="font-bold text-xl">Waiting for an other player</p>
        </div>
      }
      {isStarted && currentGame && <GamePanel
        currentGame={currentGame}
        setCurrentGame={setCurrentGame}
        gameState={gameState}
        isCreater={isCreater.current}
        mapNumber={mapNumber.current}
      />}
    </main>
  )
}
