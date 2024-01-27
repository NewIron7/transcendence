"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import axios from "axios"

const formSchema = z.object({
    username: z.string().min(3, {
        message: "Username must be at least 3 characters.",
    }),
})

export function FormUsername() {
    const { toast } = useToast()
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
        },
    })

    async function updateUsername(newUsername: string) {
        const url = process.env.NEXT_PUBLIC_BACKEND_USER_USERNAME;
        if (!url)
            return ('NEXT_PUBLIC_BACKEND_USER_USERNAME is not defined in the environment variables.');
    
        return await axios.post(url,
            {
                newUsername: newUsername,
            },
            {
                withCredentials: true,
            })
            .then(res => {
                return res.data;
            })
            .catch(error => {
                if (error.response?.data?.message?.message) {
                    return (error.response.data.message.message);
                }
                return "No error message";
            });
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const updated = await updateUsername(values.username);
        if (updated === true) {
            toast({
                title: "Username succesfully changed!",
                description: "You must login again",
            })
            router.push('/login');
        } else {
            toast({
                title: "Uh oh! Something went wrong.",
                description: updated,
                variant: "destructive",
            })
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                                <Input placeholder="username" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is your public display name.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Change</Button>
            </form>
        </Form>

    )
}
