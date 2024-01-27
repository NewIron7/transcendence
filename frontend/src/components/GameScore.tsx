import { ICurrentGame } from "@/types/ICurrentGame"
import { Swords } from "lucide-react"
import { Avatar, AvatarImage } from "./ui/avatar"
import { ILightGameState } from "@/types/IGameElems"

export default function GameScore({ currentGame, gameState, isCreater }: {
    currentGame: ICurrentGame,
    gameState: ILightGameState,
    isCreater: boolean,
}) {

    

    return (
        <div
            className="p-5 flex justify-between items-center font-bold text-2xl border-4 border-white border-solid rounded-2xl w-fit">
            <Avatar className="mr-1">
                <AvatarImage src={currentGame.creater.picUrl} />
            </Avatar>
            <span className="mr-5 ml-2">{currentGame.creater.username}</span>
            <span className="text-4xl">{gameState.createrPaddle.score}</span>
            <Swords className="h-10 w-10 mr-3 ml-3" />
            <span className="text-4xl">{gameState.invitedPaddle.score}</span>
            <span className="mr-2 ml-5">{currentGame.invited.username}</span>
            <Avatar className="mr-1">
                <AvatarImage src={currentGame.invited.picUrl} />
            </Avatar>
        </div>
    )
}