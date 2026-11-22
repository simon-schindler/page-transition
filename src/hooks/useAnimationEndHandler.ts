"use client"

import { useRef } from "react"

import type { RefObject } from "react"

import type { AnimationEndHandler } from "../types/animationEnd.types"

export function useAnimationEndHandler():RefObject<AnimationEndHandler>{
    
    const animationEndHandler = useRef<AnimationEndHandler>({
        handler: null,
        handlerEl: null
    })

    return animationEndHandler
}