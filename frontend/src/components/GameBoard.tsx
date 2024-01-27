'use client'

import { ICurrentGame } from "@/types/ICurrentGame";
import { Dispatch, SetStateAction, useCallback, useEffect, useRef } from "react";
import { AspectRatio } from "./ui/aspect-ratio";
import { IBall, ILightGameState, IPaddle, IUpdatePaddle } from "@/types/IGameElems";
import { drawArc, drawRect } from "@/lib/drawing";
import { gameSocket } from "@/sockets/gameSocket";
import { convert_coordinates } from "@/lib/utils";

export default function GameBoard({ currentGame, setCurrentGame, gameState, isCreater, mapNumber }: {
    currentGame: ICurrentGame,
    setCurrentGame: Dispatch<SetStateAction<ICurrentGame | undefined>>,
    gameState: ILightGameState,
    isCreater: boolean,
    mapNumber: number,
}) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const imageThemeRef = useRef<HTMLImageElement | null>(null);

    const resizeCanvas = useCallback(async () => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }
        if (canvas.parentElement) {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
        }
        // Draw black background
        const context = canvas.getContext("2d");
        if (!context) {
            return;
        }

        if (contextRef.current && canvasRef.current) {
            render(
                contextRef.current,
                canvasRef.current,
                gameState.ball,
                gameState.createrPaddle,
                gameState.invitedPaddle,
            );
        }

    }, [canvasRef, contextRef, gameState.ball, gameState.createrPaddle, gameState.invitedPaddle]);

    const render = (
        ctx: CanvasRenderingContext2D,
        canvas: HTMLCanvasElement,
        ball: IBall,
        user1: IPaddle,
        user2: IPaddle
    ) => {

        if (imageThemeRef.current) {
            ctx.drawImage(imageThemeRef.current, 0, 0, canvas.width, canvas.height);
        } else {
            // //clear canvas
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }


        // draw the user1 paddle
        drawRect(user1.x, user1.y, user1.width, user1.height, user1.color, ctx, canvas);

        // draw the user2 paddle
        drawRect(user2.x, user2.y, user2.width, user2.height, user2.color, ctx, canvas);

        // draw the ball
        drawArc(ball.x, ball.y, ball.radius, ball.color, ctx, canvas);
    }

    const handleMouseMove = useCallback((evt: MouseEvent) => {
        if (!canvasRef.current) {
            return;
        }
        const rect = canvasRef.current.getBoundingClientRect();
        let newUpdatePaddle: IUpdatePaddle = {
            isCreater: isCreater,
            y: 0,
        }
        const newDim = convert_coordinates(
            gameState.createrPaddle.height,
            gameState.invitedPaddle.height,
            +(process.env.NEXT_PUBLIC_RES_WIDTH || ""),
            +(process.env.NEXT_PUBLIC_RES_HEIGHT || ""),
            canvasRef.current.width,
            canvasRef.current.height,
        );
        if (!isCreater) {
            newUpdatePaddle.y = evt.clientY - rect.top - (newDim.x / 2);
        } else {
            newUpdatePaddle.y = evt.clientY - rect.top - (newDim.y / 2);
        }
        const newY = convert_coordinates(
            newUpdatePaddle.y,
            newUpdatePaddle.y,
            canvasRef.current.width,
            canvasRef.current.height,
            +(process.env.NEXT_PUBLIC_RES_WIDTH || ""),
            +(process.env.NEXT_PUBLIC_RES_HEIGHT || ""),
        );
        newUpdatePaddle.y = newY.y;

        gameSocket.emit('paddle_update', {
            newUpdatePaddle,
            currentGameId: currentGame.id
        });
    }, [isCreater, gameState.createrPaddle.height, gameState.invitedPaddle.height, canvasRef, currentGame.id]);

    useEffect(() => {
        imageThemeRef.current = new Image();
        imageThemeRef.current.src = (process.env.NEXT_PUBLIC_BACKEND_THEMES + "") + mapNumber + ".png";
    }, [mapNumber, resizeCanvas]);


    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            contextRef.current = canvas.getContext("2d");
            canvas.addEventListener("mousemove", handleMouseMove);
        }


        resizeCanvas();

        const handleResize = () => {
            resizeCanvas();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (canvas) {
                canvas.addEventListener("mousemove", handleMouseMove);
            }
        };
    }, [handleMouseMove, resizeCanvas]);

    useEffect(() => {
        if (contextRef.current && canvasRef.current) {
            render(
                contextRef.current,
                canvasRef.current,
                gameState.ball,
                gameState.createrPaddle,
                gameState.invitedPaddle,
            );
        }

    }, [gameState]);

    return (

        <div className="w-1/2 h-full mt-3 ">
            <AspectRatio ratio={16 / 9} className="">
                <canvas ref={canvasRef}></canvas>
            </AspectRatio>
        </div>

    )
}