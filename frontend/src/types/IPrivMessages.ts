interface IPrivMessages {
    id: string,
    createdAt: Date,
    msg: string,
    sender: {
        username: string,
        picUrl: string,
    },
    type: string,
}