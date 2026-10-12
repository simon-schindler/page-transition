"use client"

import { useEffect, useRef } from "react"

import type { RefObject } from "react"

interface TransitionEndData{
    elArray: (HTMLDivElement|null)[]
    propertyName: 'opacity'|'clip-path'
}
interface Props{
    elArray: RefObject<HTMLDivElement|null|(HTMLDivElement|null)[]>
    transitionProperty: 'opacity'|'clip-path'
}

export function useTransitionEndData({
    elArray,
    transitionProperty
}:Props): RefObject<TransitionEndData>{
    
    const transitionEndData = useRef<TransitionEndData>({
        elArray: [],
        propertyName: transitionProperty
    })

    useEffect(()=>{
        transitionEndData.current={
            ...transitionEndData.current,
            elArray: Array.isArray(elArray.current) ? 
            elArray.current:
            [elArray.current],
        }
    },[])
    
    return transitionEndData
}