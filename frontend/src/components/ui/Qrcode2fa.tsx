import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import Image from "next/image";

export default function Qrcode2fa(props: any) {
    const qrcode = props.qrcode;
    return (
        <Dialog>
            <DialogTrigger className="bg-sky-600 rounded-full p-2 font-bold ">QR CODE</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogDescription>
                            <Image
                                src={decodeURIComponent(qrcode)}
                                alt="logo"
                                height={300}
                                width={300}
                                className=""
                            />
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}