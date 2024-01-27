"use client"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"



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
import {  checkUserExist } from "@/app/actions"
import { useRouter } from "next/navigation"

const formSchema = z.object({
    username: z.string(),
})


export default function FindPlayer() {
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const res = await checkUserExist(values.username);
        if (res === true) {
            toast({
                title: "User found!",
            })
            router.push("/profile/" + values.username);
        } else {
            toast({
                title: res,
                variant: "destructive",
            })
        }
    }

    return (
        <div className="m-1">
            <Card>
                <CardContent>
                    <div className="flex items-center justify-center">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-1">
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Add friend</FormLabel>
                                            <FormControl>
                                                <Input placeholder="username" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit">Search</Button>
                            </form>
                        </Form>
                    </div>
                </CardContent>
            </Card>
        </div>


    );
}

