"use client"

import { useRef } from "react"

import type { RefObject } from "react"

interface TransitionEndHandler {
    handler: ((e: TransitionEvent) => void) | null
    handlerEl: HTMLDivElement | null
}

export function useTransitionEndHandler():RefObject<TransitionEndHandler>{
    
    const transitionEndHandler = useRef<TransitionEndHandler>({
        handler: null,
        handlerEl: null
    })

    return transitionEndHandler
}