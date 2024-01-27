'use client'

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast";
import { IUser } from "@/types/IUser";
import axios from "axios";
import { Mail, Medal, Skull, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function ProfilePage({ params }: {
    params: { username: string, }
}) {
    const username = params.username;
    const [userData, setUserData] = useState<IUser>({
        username: username,
        login: "",
        email: "",
        picUrl: process.env.NEXT_PUBLIC_BACKEND_AVATARS + "default.png",
        Wins: 0,
        Losses: 0,
        status: 'offline',
        xp: 0,
    });
    const [userRequest, setUserRequest] = useState({ status: 'pending' });
    const [sendRequest, setSendRequest] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const router = useRouter();
    const checkIsMe = useRef<boolean>(false);

    async function blockUserAction() {
        const url = process.env.NEXT_PUBLIC_BACKEND_BLOCK;
        if (!url)
            throw new Error('NEXT_PUBLIC_BACKEND_BLOCK is not defined in the environment variables.');
        await axios.post(url, { username: username }, {
            withCredentials: true,
        })
            .then(res => {
                toast({
                    title: res.data,
                })
                setSendRequest(true);
            })
            .catch(error => {
                toast({
                    title: "Uh oh! Something went wrong.",
                    description: error?.response?.data?.message?.message,
                    variant: "destructive",
                })
            });
    }

    async function unblockUserAction() {
        const url = process.env.NEXT_PUBLIC_BACKEND_UNBLOCK;
        if (!url)
            throw new Error('NEXT_PUBLIC_BACKEND_UNBLOCK is not defined in the environment variables.');
        await axios.post(url, { username: username }, {
            withCredentials: true,
        })
            .then(res => {
                toast({
                    title: res.data,
                })
                setSendRequest(true);
            })
            .catch(error => {
                toast({
                    title: "Uh oh! Something went wrong.",
                    description: error?.response?.data?.message?.message,
                    variant: "destructive",
                })
            });
    }

    async function addFriendAction() {
        const url = process.env.NEXT_PUBLIC_BACKEND_FRIENDS_REQUEST;
        if (!url)
            throw new Error('NEXT_PUBLIC_BACKEND_FRIENDS_REQUEST is not defined in the environment variables.');
        await axios.post(url, { friendUsername: username }, {
            withCredentials: true,
        })
            .then(res => {
                toast({
                    title: res.data,
                })
                setSendRequest(true);
            })
            .catch(error => {
                toast({
                    title: "Uh oh! Something went wrong.",
                    description: error?.response?.data?.message?.message,
                    variant: "destructive",
                })
            });
    }

    async function cancelFriendAction() {
        const url = process.env.NEXT_PUBLIC_BACKEND_FRIENDS_REQUEST;
        if (!url)
            throw new Error('NEXT_PUBLIC_BACKEND_FRIENDS_REQUEST is not defined in the environment variables.');
        await axios.post(url + '-cancel/' + username, {}, {
            withCredentials: true,
        })
            .then(res => {
                toast({
                    title: res.data,
                })
                setSendRequest(true);
            })
            .catch(error => {
                toast({
                    title: "Uh oh! Something went wrong.",
                    description: error?.response?.data?.message?.message,
                    variant: "destructive",
                })
            });
    }

    async function deleteFriendAction() {
        const url = process.env.NEXT_PUBLIC_BACKEND_FRIENDS_REQUEST;
        if (!url)
            throw new Error('NEXT_PUBLIC_BACKEND_FRIENDS_REQUEST is not defined in the environment variables.');
        await axios.post(url + '-delete/' + username, {}, {
            withCredentials: true,
        })
            .then(res => {
                toast({
                    title: res.data,
                })
                setSendRequest(true);
            })
            .catch(error => {
                toast({
                    title: "Uh oh! Something went wrong.",
                    description: error?.response?.data?.message?.message,
                    variant: "destructive",
                })
            });
    }

    useEffect(() => {
        const getUserData = async () => {

            const url = process.env.NEXT_PUBLIC_BACKEND_USER_OTHER;
            if (!url)
                throw new Error('NEXT_PUBLIC_BACKEND_USER_OTHER is not defined in the environment variables.');

            return await axios.get(url + username, {
                withCredentials: true,
            })
                .then(res => {
                    setUserData(res.data);
                })
                .catch(error => {
                    toast({
                        title: "Uh oh! Something went wrong.",
                        description: error?.response?.data?.message?.message,
                        variant: "destructive",
                    })
                });
        }
        const getRequestUser = async () => {
            const url = process.env.NEXT_PUBLIC_BACKEND_FRIENDS_REQUEST;
            if (!url)
                throw new Error('NEXT_PUBLIC_BACKEND_FRIENDS_REQUEST is not defined in the environment variables.');
            return await axios.get(url + '/' + username, {
                withCredentials: true,
            })
                .then(res => {
                    setUserRequest(res.data);
                })
                .catch(error => {
                    toast({
                        title: "Uh oh! Something went wrong.",
                        description: error?.response?.data?.message?.message,
                        variant: "destructive",
                    })
                });
        }

        const getIfUserBlocked = async () => {
            const url = process.env.NEXT_PUBLIC_BACKEND_BLOCK;
            if (!url)
                throw new Error('NEXT_PUBLIC_BACKEND_BLOCK is not defined in the environment variables.');
            return await axios.get(url + "/" + username, {
                withCredentials: true,
            })
                .then(res => {
                    setIsBlocked(res.data);
                })
                .catch(error => {
                    toast({
                        title: "Uh oh! Something went wrong.",
                        description: error?.response?.data?.message?.message,
                        variant: "destructive",
                    })
                });
        }


        getIfUserBlocked();
        getUserData();
        getRequestUser();
        setSendRequest(false);
    }, [sendRequest, username]);

    useEffect(() => {
        const getIsMe = async () => {
            const url = process.env.NEXT_PUBLIC_BACKEND_USER_IS_ME;
            if (!url)
                throw new Error('NEXT_PUBLIC_BACKEND_USER_IS_ME is not defined in the environment variables.');
            return await axios.get(url, {
                params: {
                    username: username,
                },
                withCredentials: true,
            })
                .then(res => {
                    if (res.data) {
                        router.replace("/profile")
                    }
                })
                .catch(error => {
                    toast({
                        title: "Uh oh! Something went wrong.",
                        description: error?.response?.data?.message?.message,
                        variant: "destructive",
                    })
                    router.replace("/profile")
                });
        }

        getIsMe();
        checkIsMe.current = true;
    }, [router, username]);

    return (
        <main className="flex flex-col items-center justify-between p-3">
            <Card>
                <CardHeader>
                    <CardTitle>
                        <div className="flex flex-col items-center max-w-full">
                            <div className="flex">
                                <Avatar className="w-40 h-40 m-3">
                                    <AvatarImage src={userData.picUrl} />
                                </Avatar>
                            </div>
                            <div className="flex items-center font-bold">
                                <p className="mr-3">{userData.username}</p>
                                {userRequest?.status === 'accepted' &&
                                    (
                                        userData.status === 'online' && userRequest.status === 'accepted' ?
                                            <Badge className="bg-lime-500">ONLINE</Badge>
                                            : userData.status === 'playing' ?
                                                <Badge className="bg-teal-400">IN GAME</Badge>
                                                : <Badge variant="destructive">OFFLINE</Badge>
                                    )
                                }

                            </div>
                            <Badge variant="secondary" className="mt-3 bg-indigo-600/75">{userData.xp}xp</Badge>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center mb-3 justify-between">
                        <div className="flex items-center">
                            <User />
                            <div className="ml-5 mr-5">
                                <Badge variant="outline"><p className="text-base">{userData.login}</p></Badge>
                            </div>

                        </div>
                    </div>
                    <div className="flex items-center mb-3 justify-between">
                        <div className="flex items-center">
                            <Mail />
                            <div className="ml-5 mr-5">
                                <Badge variant="outline"><p className="text-base">{userData.email}</p></Badge>
                            </div>
                        </div>

                    </div>
                    <div className="flex items-center mb-3 justify-between">
                        <div className="flex items-center">
                            <Medal />
                            <div className="ml-5 mr-5">
                                <Badge variant="outline"><p className="text-base">{userData.Wins}</p></Badge>
                            </div>

                        </div>
                    </div>
                    <div className="flex items-center mb-3 justify-between">

                        <div className="flex items-center">
                            <Skull />
                            <div className="ml-5 mr-5">
                                <Badge variant="outline"><p className="text-base">{userData.Losses}</p></Badge>
                            </div>

                        </div>
                    </div>
                </CardContent>
                {checkIsMe &&
                    <CardFooter className="justify-between">
                        {userRequest ?
                            (userRequest.status === 'pending' ? <Button variant="secondary" className="bg-amber-700" onClick={cancelFriendAction}>Cancel request</Button> :
                                userRequest.status === 'accepted' ? <Button variant="secondary" className="bg-rose-600" onClick={deleteFriendAction}>Remove friend</Button>
                                    : userRequest.status == 'declined' ? <Badge className="bg-red-600">Declined</Badge>
                                        : <Button disabled variant="outline">Add Friend</Button>)
                            : <Button variant="secondary" onClick={addFriendAction}>Add Friend</Button>}

                        {isBlocked ?
                            <Button variant="ghost" className="bg-indigo-950 ml-1" onClick={unblockUserAction}>Unblock</Button>
                            : <Button variant="secondary" className="bg-red-900 ml-1" onClick={blockUserAction}>Block</Button>
                        }

                    </CardFooter>
                }

            </Card>


        </main>
    );
}