"use client"

import { useEffect, useRef } from "react"

import type { RefObject } from "react"

import type { TransitionEndData } from "../types/transitionEnd.types"

interface Props{
    elArray: RefObject<HTMLDivElement|null|(HTMLDivElement|null)[]>
    transitionProperty: 'opacity'|'clip-path'
    secondElArray: RefObject<(HTMLDivElement|null)[]>
}

export function useTransitionEndData({
    elArray,
    transitionProperty,
    secondElArray
}:Props): RefObject<TransitionEndData>{
    
    const transitionEndData = useRef<TransitionEndData>({
        elArray: [],
        transitionProperty,
        secondElArray: [],
    })

    useEffect(()=>{
        transitionEndData.current={
            ...transitionEndData.current,
            elArray: Array.isArray(elArray.current) ? 
            elArray.current:[elArray.current],
            secondElArray: secondElArray.current
        }
    },[])
    
    return transitionEndData
}