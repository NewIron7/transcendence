import Link from "next/link";
import { Avatar, AvatarImage } from "./ui/avatar";

interface IMessages {
    createdAt: Date,
    msg: string,
    User: {
        username: string,
        picUrl: string,
    },
}

export default function Message({ message, id }: { message: IMessages, id: string }) {

    function formatReadableDate(date: Date) {
        const nDate = new Date(date);
        const str = nDate.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            timeZoneName: 'short'
        });
        return (str);
    }

    return (
        <div className="flex items-center mt-2 w-fit" id={id}>
            <Link href={process.env.NEXT_PUBLIC_PROFILE + '/' + message.User.username}>
                <Avatar className="mr-1">
                    <AvatarImage src={message.User.picUrl} />
                </Avatar>
            </Link>

            <div className="bg-sky-950 p-2 rounded-md flex flex-col items-start mr-2 ml-2">
                <h1 className="text-bold text-slate-400">{message.User.username}</h1>
                <p className="text-base text-wrap break-all">
                    {message.msg}
                </p>
                <p className="text-slate-400">{formatReadableDate(message.createdAt)}</p>
            </div>
        </div>

    );
}