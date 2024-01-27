export interface IGameHistory {
    updatedAt: Date,
    winnerScore: number,
    loserScore: number,
    winner: {
        username: string,
        picUrl: string,
    },
    loser: {
        username: string,
        picUrl: string,
    },
}