import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

export default function Login() {
    return (
        <div className="flex flex-col items-center">
            <div className="relative h-44 w-44">
            <Image
                src="/static/logo.png"
                alt="logo"
                fill
                className=""
            />
            </div>
            
            <Button asChild className="p-7 ">

                <Link href={process.env.FORTYTWO_LOGIN_URL || "/error"}>
                    <Image
                        src="/static/42.svg"
                        alt="42 logo"
                        height={50}
                        width={50}
                        className="m-3"
                    />
                    <p className="font-bold text-white text-lg">
                        Login
                    </p>
                </Link>
            </Button>
            {/* <Button asChild className="p-7 m-3 bg-red-700">

                <Link href={process.env.FORTYTWO_FAKELOGIN_URL || "/error"}>
                    <p className="font-bold text-white text-lg">
                        Fake LOGIN
                    </p>
                </Link>
            </Button> */}
        </div>
    )
}