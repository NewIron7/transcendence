import { Menu, Settings } from "lucide-react";
import Container from "./ui/container";
import { SheetContent, SheetTrigger, Sheet } from "./ui/sheet";
import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image"
import ProfileButton from "./ui/ProfileButton";


export default function Header() {

    const routes = [
        {
            href: "/game",
            label: "Game",
        },
        {
            href: "/chat",
            label: "Chat",
        },
        {
            href: "/friends",
            label: "Friends",
        },
        {
            href: "/messages",
            label: "Messages",
        },
    ];

    return (
        <header className="sm:flex sm:justify-between py-3 px-4 border-b">
            <Container>
                <div className="relative px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between w-full">
                    <div className="flex items-center">
                        <Sheet>
                            <SheetTrigger>
                                <Menu className="h-6 md:hidden w-6" />
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                                <nav className="flex flex-col gap-4">
                                    {routes.map((route, i) => (
                                        <Link
                                            key={i}
                                            href={route.href}
                                            className="block px-2 py-1 text-lg"
                                        >
                                            {route.label}
                                        </Link>
                                    ))}
                                </nav>
                            </SheetContent>
                        </Sheet>
                        <Link href="/" className="ml-4 lg:ml-0">
                            <Image
                                src="/static/logo.png"
                                alt="logo"
                                width={100}
                                height={100}
                                className="m-3"
                                priority={true}
                            />
                        </Link>
                    </div>
                    <nav className="mx-6 hidden items-center space-x-4 lg:space-x-6 md:block">
                        {routes.map((route, i) => (
                            <Button key="{i}" asChild variant="ghost">
                                <Link
                                    key={i}
                                    href={route.href}
                                    className="text-sm font-medium transition-colors"
                                >
                                    {route.label}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                    <div className="flex items-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="mr-2"
                            aria-label="Settings"
                        >
                            <Link href="/settings" className="ml-4 lg:ml-0">
                                <Settings className="h-6 w-6" />
                            </Link>

                        </Button>
                        <ProfileButton />
                    </div>
                </div>
            </Container>
        </header >
    );
}