"use client"

import { useRef } from "react"

import type { RefObject } from "react"

import type { TransitionEndHandler } from "../types/transitionEnd.types"

export function useTransitionEndHandler():RefObject<TransitionEndHandler>{
    
    const transitionEndHandler = useRef<TransitionEndHandler>({
        handler: null,
        handlerEl: null
    })

    return transitionEndHandler
}