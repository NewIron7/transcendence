'use client'

import { turn2fa } from "@/app/actions";
import Qrcode2fa from "@/components/ui/Qrcode2fa";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";

import axios from "axios";
import { useEffect, useState } from "react";




export default function Settings() {
    const [twofa, setTwofa] = useState(false);
    const [qrcode, setQrcode] = useState("");

    useEffect(() => {
        const getIs2fa = async () => {

            const url = process.env.NEXT_PUBLIC_FORTYTWO_IS_2FA;
            if (!url)
                throw new Error('NEXT_PUBLIC_FORTYTWO_IS_2FA is not defined in the environment variables.');

            return await axios.get(url, {
                withCredentials: true,
            })
                .then(res => {
                    setTwofa(res.data);
                })
                .catch(error => {
                    toast({
                        title: "Uh oh! Something went wrong.",
                        description: "Error while fetching user data" + error?.response?.data?.message?.message,
                        variant: "destructive",
                    })
                });
        }

        getIs2fa();

    }, []);

    const onTwofaChange = async (event: any) => {
        const res = await turn2fa(event);
        if (typeof res === 'object') {
            if (event) {
                setQrcode(res.qrcode);
                toast({
                    title: "2FA activated!",
                })
            } else {
                toast({
                    title: res.message,
                })
            }

        } else {
            toast({
                title: "Uh oh! Something went wrong.",
                description: res,
                variant: "destructive",
            })
        }
        setTwofa(event);
    }

    return (
        <div className="flex flex-col items-center ">
            <Card className="m-3">
                <CardHeader>
                    <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <Card>
                        <CardHeader>
                            <CardTitle>2FA</CardTitle>
                            <CardDescription>You can turn on/off the two factor authentification</CardDescription>

                        </CardHeader>
                        <CardContent className="flex">
                            <Switch checked={twofa} onCheckedChange={onTwofaChange} />
                            <div className="w-full flex justify-between">
                                <p className="ml-3 font-bold">{twofa ? "ON" : "OFF"}</p>
                                {twofa && qrcode &&
                                    <Qrcode2fa qrcode={qrcode} />
                                }
                            </div>
                        </CardContent>
                        <CardFooter>
                            {twofa && qrcode &&
                                <span>Make sure to properly configure your 2fa, you will need it to login</span>
                            }
                        </CardFooter>
                    </Card>

                </CardContent>
            </Card>

        </div>
    );
}