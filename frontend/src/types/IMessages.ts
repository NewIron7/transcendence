export interface IMessages {
    id: string,
    createdAt: Date,
    msg: string,
    User: {
        username: string,
        picUrl: string,
    },
    type: string,
}