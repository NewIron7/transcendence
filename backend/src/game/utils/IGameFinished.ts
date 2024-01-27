export interface IGameFinished {
    creater: {
        id: string;
        xp: number;
    },
    invited: {
        id: string;
        xp: number;
    },
    id: string;
    createdAt: Date;
    createrId: string;
    createrScore: number;
    invitedId: string;
    invitedScore: number;
    winScore: number;
}