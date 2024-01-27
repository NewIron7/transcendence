import { IBall, ILightGameState, IPaddle, initializeBall, initializeCreater, initializeInvited } from "./IGameElems";


export class GameState{
    intervalId: NodeJS.Timer;
    ball: IBall;
    createrPaddle: IPaddle;
    invitedPaddle: IPaddle;

    constructor() {
        this.ball = initializeBall();
        this.createrPaddle = initializeCreater();
        this.invitedPaddle = initializeInvited();
    }

    light(): ILightGameState {
        return ({
            ball: this.ball,
            createrPaddle: this.createrPaddle,
            invitedPaddle: this.invitedPaddle,
        })
    }
}