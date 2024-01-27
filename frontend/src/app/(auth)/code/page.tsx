"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useRouter, useSearchParams } from "next/navigation"
import axios from "axios"

const formSchema = z.object({
    code: z.string(),
})

export default function Code() {
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const state = searchParams.get('state');
    const username = searchParams.get('username');

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            code: "",
        },
    })

    async function checkCode2fa(
        username: string,
        state: string,
        code: string,
    ) {
        if (!username || !state || !code)
            return "Unauthorized";
    
        const url = process.env.NEXT_PUBLIC_BACKEND_CHECK_CODE_2FA;
        if (!url)
            return ('NEXT_PUBLIC_BACKEND_CHECK_CODE_2FA is not defined in the environment variables.');
    
        return await axios.post(url,
            {
                code: code,
            },
            {
                params: {
                    username: username,
                    state: state,
                },
                withCredentials: true,
            })
            .then(res => {
                return (true);
            })
            .catch(error => {
                if (error.response?.data?.message?.message) {
                    return (error.response.data.message.message);
                }
                return "Unauthorized";
            });
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const res = await checkCode2fa(username || "", state || "", values.code);
        if (res === true) {
            toast({
                title: "Succesfully login!",
            })
            router.replace("/");
        } else {
            toast({
                title: res,
                variant: "destructive",
            })
        }
    }

    return (
        <div className="h-screen flex items-center justify-center">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>2FA CODE</FormLabel>
                                <FormControl>
                                    <Input placeholder="Code" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit">Submit</Button>
                </form>
            </Form>
        </div>



    )
}
