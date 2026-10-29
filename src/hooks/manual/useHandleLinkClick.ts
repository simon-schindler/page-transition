"use client"

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import type { RefObject } from "react";

interface Props{
    handleLinkClick: RefObject<((e: React.MouseEvent, url: string)=>void)>
    resolveFn: RefObject<(()=>void)|null>
    state: RefObject<'idle'|'exiting'|'entering'>
    currentPathname: RefObject<string>
    basePath: RefObject<string|null>
    useUse: RefObject<boolean>
    resolveUseFn: RefObject<(()=>void)|null>
}

export function useHandleLinkClick({
    handleLinkClick,
    resolveFn,
    state,
    currentPathname,
    basePath,
    useUse,
    resolveUseFn
}:Props){
    const router = useRouter()
    
    handleLinkClick.current = useCallback((e, url)=>{
        e.preventDefault()

        const basePathUrl = basePath.current? basePath.current + url : url

        new Promise<void>((resolve)=>{
            resolveFn.current = resolve
            state.current = 'exiting'

        }).then(()=>{
            if(useUse.current)resolveUseFn.current?.()
            router.push(url)
            resolveFn.current = null
            if(basePathUrl === currentPathname.current){
                state.current = 'entering'
            }
        })
    },[])
}