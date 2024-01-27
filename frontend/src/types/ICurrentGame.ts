export interface ICurrentGame {
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