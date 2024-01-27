import axios from "axios";
import { redirect } from "next/navigation";
import { headers } from 'next/headers'
import Header from "@/components/Header";
import { toast } from "@/components/ui/use-toast";

async function isLoggedIn() {
    const cookies = headers().get('Cookie');
    if (!cookies)
        return false;

    const url = process.env.NEXT_PUBLIC_FORTYTWO_IS_LOGGED;
    if (!url)
        throw new Error('NEXT_PUBLIC_FORTYTWO_IS_LOGGED is not defined in the environment variables.');
    return await axios.get(url, {
        headers: { 'Cookie': cookies },
    })
        .then(res => {
            return true;
        })
        .catch(error => {
            toast({
                title: "Uh oh! Something went wrong.",
                description: "Error while fetching user data" + error?.response?.data?.message?.message,
                variant: "destructive",
            })
            return false;
        });
}

export default async function CheckToken({
    children,
}: {
    children: React.ReactNode
}) {

    const logged = await isLoggedIn();
    if (!logged) {
        redirect('/login');
    }

    return (
        <>
            <div className="h-screen flex flex-col">
                <Header />
                {children}
            </div>

        </>
    )
}