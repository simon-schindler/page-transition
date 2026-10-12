"use client"

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import type { RefObject } from "react";

interface Props{
    handleLinkClick: RefObject<((e: React.MouseEvent, url: string)=>void)>
    resolveFn: RefObject<(()=>void)|null>
    state: RefObject<'idle'|'exiting'|'entering'>
    popRun: RefObject<boolean>
}

export function useHandleLinkClick({
    handleLinkClick,
    resolveFn,
    state,
    popRun
}:Props){
    const router = useRouter()
    
    handleLinkClick.current = useCallback((e, url)=>{
        e.preventDefault()

        if(popRun.current)return

        new Promise<void>((resolve)=>{
            resolveFn.current = resolve
            state.current = 'exiting'

        }).then(()=>{
            router.push(url)
        })
    },[])
}