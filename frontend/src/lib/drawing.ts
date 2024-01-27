import { convert_coordinates } from "./utils";

export const drawRect = (
    x: number,
    y: number,
    w: number,
    h: number,
    color: string,
    ctx: CanvasRenderingContext2D,
    cv: HTMLCanvasElement,
) => {
    const newPos = convert_coordinates(
        x,
        y,
        +(process.env.NEXT_PUBLIC_RES_WIDTH || ""),
        +(process.env.NEXT_PUBLIC_RES_HEIGHT || ""),
        cv.width,
        cv.height,
    );
    const newDim = convert_coordinates(
        w,
        h,
        +(process.env.NEXT_PUBLIC_RES_WIDTH || ""),
        +(process.env.NEXT_PUBLIC_RES_HEIGHT || ""),
        cv.width,
        cv.height,
    );

    ctx.fillStyle = color;
    ctx.fillRect(newPos.x, newPos.y, newDim.x, newDim.y);
};

export const drawArc = (
    x: number,
    y: number,
    r: number,
    color: string,
    ctx: CanvasRenderingContext2D,
    cv: HTMLCanvasElement,
) => {
    if (!ctx) {
        return;
    }

    const newPos = convert_coordinates(
        x,
        y,
        +(process.env.NEXT_PUBLIC_RES_WIDTH || ""),
        +(process.env.NEXT_PUBLIC_RES_HEIGHT || ""),
        cv.width,
        cv.height,
    );

    const newBallRadius = convert_coordinates(
        r,
        r,
        +(process.env.NEXT_PUBLIC_RES_WIDTH || ""),
        +(process.env.NEXT_PUBLIC_RES_HEIGHT || ""),
        cv.width,
        cv.height,
    );

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(newPos.x, newPos.y, newBallRadius.x, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
};

