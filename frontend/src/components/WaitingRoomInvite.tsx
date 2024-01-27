'use client'

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerTrigger,
    DrawerFooter,
} from "@/components/ui/drawer"
import { Button } from "./ui/button";
import { Dispatch, SetStateAction, useState } from "react";
import { Loader2 } from "lucide-react";
import { roomSocket } from "@/sockets/roomSocket";
import { toast } from "./ui/use-toast";


export default function WaitingRoomInvite({ messageId, inWaiting, setInWaiting }: {
    messageId: string,
    inWaiting: boolean,
    setInWaiting: Dispatch<SetStateAction<boolean>>,
}) {

    async function onCancel() {
        if (!inWaiting) {
            return;
        }
        roomSocket.emit('cancel_wait', messageId, (joined: boolean) => {
            if (joined) {
                setInWaiting(false);
            } else {
                toast({
                    title: "You cannot cancel this game",
                    variant: "destructive",
                })
            }
        });
    }

    async function onJoin() {
        if (inWaiting) {
            return;
        }
        roomSocket.emit('join_wait', messageId, (joined: boolean) => {
            if (joined) {
                setInWaiting(true);
            } else {
                toast({
                    title: "You cannot join this game",
                    variant: "destructive",
                })
            }
        });
    }

    return (
        <Drawer>
            <DrawerTrigger asChild>
                <div>
                    {!inWaiting ?
                        <Button className="font-bold bg-lime-800" variant="secondary"
                            onClick={onJoin}>JOIN
                        </Button>
                        : <Button className="font-bold bg-yellow-800" variant="secondary">
                            WAITING
                        </Button>
                    }
                </div>

            </DrawerTrigger>
            <DrawerContent>
                {inWaiting &&
                    <div className="flex flex-col items-center mt-3">
                        <Loader2 className="h-16 w-16 animate-spin" />
                        <p className="font-bold text-xl">Waiting for your opponent</p>
                    </div>
                }
                <DrawerFooter>
                    <DrawerClose>
                        <Button variant="outline" onClick={onCancel}>Cancel</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>

    );
}