"use client"

import { useEffect, useRef } from "react"

import type { RefObject } from "react"

import type { AnimationEndData } from "../types/animationEnd.types"

interface Props{
    elArray: RefObject<HTMLDivElement|null|(HTMLDivElement|null)[]>
    group: RefObject<'overlay'|null>
}

export function useAnimationEndData({
    elArray,
    group
}:Props): RefObject<AnimationEndData>{
    
    const animationEndData = useRef<AnimationEndData>({
        elArray: [],
        group: group.current
    })

    useEffect(()=>{
        animationEndData.current={
            ...animationEndData.current,
            elArray: Array.isArray(elArray.current) ? 
            elArray.current:[elArray.current],
        }
    },[])
    
    return animationEndData
}