import { ICurrentGame } from "@/types/ICurrentGame"
import GameScore from "./GameScore"
import { Dispatch, SetStateAction } from "react"
import GameBoard from "./GameBoard"
import { ILightGameState } from "@/types/IGameElems"

export default function GamePanel({ currentGame, setCurrentGame, gameState, isCreater, mapNumber }: {
    currentGame: ICurrentGame,
    setCurrentGame: Dispatch<SetStateAction<ICurrentGame | undefined>>,
    gameState: ILightGameState,
    isCreater: boolean,
    mapNumber: number,
}) {
    return (
        <div className="w-full h-full flex flex-col items-center">
            {/* {currentGame && <p>{currentGame.id}</p>} */}
            <GameScore
                currentGame={currentGame}
                gameState={gameState}
                isCreater={isCreater}
            />
            <GameBoard
                currentGame={currentGame}
                setCurrentGame={setCurrentGame}
                gameState={gameState}
                isCreater={isCreater}
                mapNumber={mapNumber}
            />
        </div>
    )
}