"use client"

import { useEffect, useRef } from "react"

import type { RefObject } from "react"

import type { TransitionEndData } from "../types/transitionEnd.types"

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