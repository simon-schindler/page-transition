"use client"

import {TransitionContext} from "./TransitionContext"

import { useEffect, useRef, useMemo } from "react"
import { usePathname } from "next/navigation";

import type { ReactNode } from "react";

import { usePopState } from "../hooks/manual/usePopState";
import { useHandleLinkClick } from "../hooks/manual/useHandleLinkClick";

interface ProviderProps{
    children: ReactNode
}
export function ManualTransitionProvider({
    children
}:ProviderProps){
    
    const pathname = usePathname()
    const handleLinkClick = useRef<((e: React.MouseEvent, url:string)=>void)>(()=>{})
    const resolveFn = useRef<(()=>void)|null>(null)
    const state = useRef<'idle'|'exiting'|'entering'>('idle')
    const useUse = useRef(false)
    const resolveUseFn = useRef<(()=>void)|null>(null)
    
    usePopState({
        resolveFn, 
        state,
        useUse,
        resolveUseFn
    })
    useHandleLinkClick({
        handleLinkClick,
        resolveFn,
        state,
        useUse,
        resolveUseFn
    })

    useEffect(()=>{
        state.current = 'entering'
    },[pathname])

    const value = useMemo(()=>({handleLinkClick, resolveFn, state}),[])
    
    return(
        <TransitionContext.Provider value={value}>
            {children}
        </TransitionContext.Provider>
    )
}