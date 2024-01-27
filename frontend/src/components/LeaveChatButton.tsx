import axios from "axios";
import { Button } from "./ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "./ui/use-toast";
import { Dispatch, SetStateAction } from "react";


export default function LeaveChatButton({ roomName, setRoom }: {
    roomName: string,
    setRoom: Dispatch<SetStateAction<string>>,
}) {

    async function leaveRoomBackend() {
        
        const url = process.env.NEXT_PUBLIC_BACKEND_ROOM_LEAVE;
        if (!url)
            throw new Error('NEXT_PUBLIC_BACKEND_ROOM_LEAVE is not defined in the environment variables.');
        await axios.post(url, {},
            {
                params: {
                    name: roomName,
                },
                withCredentials: true,
            })
            .then(res => {
                toast({
                    title: res.data,
                })
            })
            .catch(error => {
                toast({
                    title: "Uh oh! Something went wrong.",
                    description: error?.response?.data?.message?.message,
                    variant: "destructive",
                })
            });
    }

    function onLeave() {
        leaveRoomBackend();
        setRoom("");
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button className="mr-5" variant="destructive">Leave</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <Button className="mr-5 bg-red-900 hover:bg-red-700 text-white" onClick={onLeave}>Confirm</Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

    );
}