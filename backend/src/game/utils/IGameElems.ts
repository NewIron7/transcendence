export interface ILightGameState {
  ball: IBall,
  createrPaddle: IPaddle,
  invitedPaddle: IPaddle,
}

export interface IBall {
    x: number;
    y: number;
    radius: number;
    velocityX: number;
    velocityY: number;
    speed: number;
    color: string;
}

export interface IPaddle {
    x: number;
    y: number;
    width: number;
    height: number;
    score: number;
    color: string;
}

export interface IUpdatePaddle {
  isCreater: boolean,
  y: number,
}

export const initializeBall = (): IBall => {
  const width = +(process.env.NEXT_PUBLIC_RES_WIDTH || "");
  const height = +(process.env.NEXT_PUBLIC_RES_HEIGHT || "");
    return {
      x: width / 2,
      y: height / 2,
      radius: 10,
      velocityX: 5,
      velocityY: 5,
      speed: 7,
      color: "WHITE",
    };
};

export const initializeCreater = (): IPaddle => {
  const width = +(process.env.NEXT_PUBLIC_RES_WIDTH || "");
  const height = +(process.env.NEXT_PUBLIC_RES_HEIGHT || "");
    return {
      x: 0,
      y: (height - (height / 4)) / 2,
      width: width / 80,
      height: height / 4,
      score: 0,
      color: "WHITE",
    };
};
  
export const initializeInvited = (): IPaddle => {
  const width = +(process.env.NEXT_PUBLIC_RES_WIDTH || "");
  const height = +(process.env.NEXT_PUBLIC_RES_HEIGHT || "");
  return {
      x: width - (width / 80),
      y: (height - (height / 4)) / 2,
      width: width / 80,
      height: height / 4,
      score: 0,
      color: "WHITE",
    };
};
