"use client"

import { ManualContext } from "./ManualContext";

import { useEffect, useRef, useMemo, useState } from "react"
import { usePathname } from "next/navigation";

import type { ReactNode } from "react";

import { usePopState } from "../hooks/manual/usePopState";
import { useHandleLinkClick } from "../hooks/manual/useHandleLinkClick";
import { useScrollRestoration } from "../hooks/useScrollRestoration";
import { dispatchNextPathname } from "./ActiveLinkContext"

import { PrevPage } from "../components/PrevPage";

interface ProviderProps{
    scroll: 'auto'|'top'
    outside: ReactNode | null
    children: ReactNode
}
export function ManualTransitionProvider({
    scroll,
    outside,
    children
}:ProviderProps){
    
    const pathname = usePathname()
    const handleLinkClick = useRef<((e: React.MouseEvent, url:string)=>void)>(()=>{})
    const resolveFn = useRef<(()=>void)|null>(null)
    const state = useRef<'idle'|'exiting'|'entering'>('idle')
    
    const basePath = useRef<string|null>(null)
    
    const [newSnapshot, setNewSnapshot]=useState(0)
    const [visible, setVisible]=useState(false)
    const prevPage = useRef<HTMLDivElement|null>(null)

    const rejectFn = useRef<(()=>void)|null>(null)
    

    const mount=useRef({
        mounted: false,
        initPathname: pathname
    })
    
    usePopState({
        resolveFn, 
        rejectFn,
        state,
        basePath,
        setVisible,
        setNewSnapshot
    })
    useHandleLinkClick({
        handleLinkClick,
        resolveFn,
        rejectFn,
        state,
        basePath,
        setVisible,
        setNewSnapshot
    })
    useScrollRestoration({ scroll })

    useEffect(()=>{
        if(mount.current.mounted === false && 
            mount.current.initPathname === pathname
        ){
            dispatchNextPathname(pathname)
            
            basePath.current = window.location.pathname.slice(0, -pathname.length)
            
            return
        }
        mount.current.mounted = true
        
    },[pathname])

    const value = useMemo(()=>({handleLinkClick, resolveFn, state}),[])
    
    return(
        <ManualContext.Provider value={value}>
            {outside}
            {children}
            <PrevPage 
            newSnapshot={newSnapshot}
            visiblity={visible}
            prevPage={prevPage}
            children={children}
            />
        </ManualContext.Provider>
    )
}