"use client"

import { useToast } from "@/components/ui/use-toast"
import { Dispatch, SetStateAction, useState } from "react"
import axios, { AxiosResponse } from "axios";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export function FormAvatar({setIsChanged}:{setIsChanged: Dispatch<SetStateAction<boolean>>}) {
    const { toast } = useToast();
    const router = useRouter();

    const [image, setImage] = useState<File>();

    const uploadToClient = (event: any) => {
        if (event.target.files && event.target.files[0]) {
            setImage(event.target.files[0]);
        }
    };

    async function updateAvatar(newAvatar: File | null) {
        if (!newAvatar)
            return ('File is required');

        const url = process.env.NEXT_PUBLIC_BACKEND_USER_UPLOADS;
        if (!url)
            return ('BACKEND_USER_UPLOADS is not defined in the environment variables.');

        let formData = new FormData();
        formData.append("file", newAvatar);
        return axios.post(url, formData, { withCredentials: true })
            .then(function (response) {
                return true;
            })
            .catch(function (error) {
                if (error.response?.data?.message?.message) {
                    return error.response.data.message.message;
                }
                return "Error during upload";
            });
    }

    const onSubmit = async (event: any) => {
        if (!image) {
            toast({
                title: "No file selected",
                variant: "destructive",
            })
        }
        else {
            const updated: string | boolean = await updateAvatar(image);
            if (updated == true) {
                toast({
                    title: "Succesfully changed",
                })
                setIsChanged(true);
            } else {
                if (typeof updated === 'string') {
                    toast({
                        title: updated,
                        variant: "destructive",
                    })
                }
            }
        }
    }

    return (
        <div className="">
            <input type="file" onChange={uploadToClient} className="m-3" />
            <Button onClick={onSubmit}>Change</Button>
        </div>
    );
}
