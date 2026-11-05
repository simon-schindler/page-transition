"use client"

import { useEffect, useRef } from "react"

import type { RefObject } from "react"

import type { TransitionEndData } from "../types/transitionEnd.types"
import type { TransitionProperty } from "../types/transitionPropertys.types";

interface Props{
    elArray: RefObject<HTMLDivElement|null|(HTMLDivElement|null)[]>
    transitionProperty: TransitionProperty
    group: RefObject<'overlay'|null>
}

export function useTransitionEndData({
    elArray,
    transitionProperty,
    group
}:Props): RefObject<TransitionEndData>{
    
    const transitionEndData = useRef<TransitionEndData>({
        elArray: [],
        transitionProperty,
        group: group.current
    })

    useEffect(()=>{
        transitionEndData.current={
            ...transitionEndData.current,
            elArray: Array.isArray(elArray.current) ? 
            elArray.current:[elArray.current],
        }
    },[])
    
    return transitionEndData
}