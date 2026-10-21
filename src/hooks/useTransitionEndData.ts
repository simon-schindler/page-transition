"use client"

import { useEffect, useRef } from "react"

import type { RefObject } from "react"

interface TransitionEndData{
    elArray: (HTMLDivElement|null)[]
    transitionProperty: 'opacity'|'clip-path'
    mirror: boolean
    mirrorElArray: (HTMLDivElement|null)[]
    delayStep: number
    duration: number
}
interface Props{
    elArray: RefObject<HTMLDivElement|null|(HTMLDivElement|null)[]>
    transitionProperty: 'opacity'|'clip-path'
    mirror: boolean
    mirrorElArray: RefObject<(HTMLDivElement|null)[]>
}

export function useTransitionEndData({
    elArray,
    transitionProperty,
    mirror,
    mirrorElArray
}:Props): RefObject<TransitionEndData>{
    
    const transitionEndData = useRef<TransitionEndData>({
        elArray: [],
        transitionProperty,
        mirror,
        mirrorElArray: [],
        delayStep: 0,
        duration: 0
    })

    useEffect(()=>{
        transitionEndData.current={
            ...transitionEndData.current,
            elArray: Array.isArray(elArray.current) ? 
            elArray.current:[elArray.current],
            mirrorElArray: mirrorElArray.current
        }
    },[])
    
    return transitionEndData
}