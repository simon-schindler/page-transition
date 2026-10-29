"use client"

import {TransitionContext} from "./TransitionContext"

import { useEffect, useRef, useMemo } from "react"
import { usePathname } from "next/navigation";

import type { ReactNode } from "react";

import { usePopState } from "../hooks/manual/usePopState";
import { useHandleLinkClick } from "../hooks/manual/useHandleLinkClick";
import { useScrollRestoration } from "../hooks/useScrollRestoration";

interface ProviderProps{
    scroll: 'auto'|'top'
    children: ReactNode
}
export function ManualTransitionProvider({
    scroll,
    children
}:ProviderProps){
    
    const pathname = usePathname()
    const handleLinkClick = useRef<((e: React.MouseEvent, url:string)=>void)>(()=>{})
    const resolveFn = useRef<(()=>void)|null>(null)
    const state = useRef<'idle'|'exiting'|'entering'>('idle')
    const currentPathname = useRef(pathname)
    const basePath = useRef<string|null>(null)
    
    const useUse = useRef(false)
    const resolveUseFn = useRef<(()=>void)|null>(null)
    
    usePopState({
        resolveFn, 
        state,
        currentPathname,
        useUse,
        resolveUseFn
    })
    useHandleLinkClick({
        handleLinkClick,
        resolveFn,
        state,
        currentPathname,
        basePath,
        useUse,
        resolveUseFn
    })
    useScrollRestoration({ scroll })

    useEffect(()=>{
        if(basePath.current === null){
            basePath.current = window.location.pathname.slice(0, -pathname.length)
        }
        
        state.current = 'entering'
        currentPathname.current = window.location.pathname
    },[pathname])

    const value = useMemo(()=>({handleLinkClick, resolveFn, state}),[])
    
    return(
        <TransitionContext.Provider value={value}>
            {children}
        </TransitionContext.Provider>
    )
}