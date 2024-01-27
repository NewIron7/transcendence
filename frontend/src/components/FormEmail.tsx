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
import { updateEmail } from "@/app/actions"
import { useRouter } from "next/navigation"
import { Dispatch, MutableRefObject, SetStateAction } from "react"

const FormSchema = z.object({
    email: z.string().min(5, {
        message: "Username must be at least 5 characters.",
    }).email('Invalid format'),
})

export function FormEmail({setIsChanged}:{setIsChanged: Dispatch<SetStateAction<boolean>>}) {
    const { toast } = useToast()
    const router = useRouter();

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            email: "",
        },
    })

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        const updated = await updateEmail(data.email);
        if (updated === true) {
            toast({
                title: "Email succesfully changed!",
            })
            setIsChanged(true);
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
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="user@mail.fr" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Change</Button>
            </form>
        </Form>
        
    )
}
