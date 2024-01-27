import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarImage } from "./ui/avatar";
import Link from "next/link";


export default function ProfileCardPreview(props: any) {
    const friend = props.friend.sender;

    return (
        <div className="m-1">
            <Card>
                <CardHeader>
                    <CardTitle>{friend.username}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Link href={process.env.NEXT_PUBLIC_PROFILE + '/' + friend.username}>
                        <Avatar className="w-20 h-20">
                            <AvatarImage src={friend.picUrl || process.env.NEXT_PUBLIC_BACKEND_AVATARS_DEFAULT} />
                        </Avatar>
                    </Link>

                </CardContent>
            </Card>
        </div>


    );
}