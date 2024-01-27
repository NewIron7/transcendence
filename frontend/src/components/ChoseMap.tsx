'use client'

import { Card, CardContent } from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from "@/components/ui/carousel"
import { MutableRefObject, useEffect, useState } from "react"
import Image from "next/image"

export function ChoseMap({ mapNumber }: { mapNumber: MutableRefObject<number> }) {
    const [api, setApi] = useState<CarouselApi>()
    const [current, setCurrent] = useState(0)
    const [count, setCount] = useState(0)

    useEffect(() => {
        if (!api) {
            return
        }

        setCount(api.scrollSnapList().length)
        setCurrent(api.selectedScrollSnap())

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap())
        })
    }, [api])

    useEffect(() => {
        mapNumber.current = current;
    }, [mapNumber, current]);

    return (
        <div>
            <Carousel setApi={setApi} className="w-full max-w-xs" opts={{ loop: true, }}>
                <CarouselContent>
                    {Array.from({ length: 3 }).map((_, index) => (
                        <CarouselItem key={index}>
                            <Card>
                                <CardContent className="p-3">
                                    <div>
                                        <Image
                                            alt="Map choice"
                                            src={`${process.env.NEXT_PUBLIC_BACKEND_THEMES}${index}.png`}
                                            height={50}
                                            width={300}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        </div>
    )
}
