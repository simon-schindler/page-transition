"use client"

import { useEffect, useState, use } from "react";

import type { Ref, RefObject } from "react";

interface Props{
    resolveFn: RefObject<(()=>void)|null>
    state: RefObject<'idle'|'exiting'|'entering'>
    useUse: RefObject<boolean>
    resolveUseFn: RefObject<(()=>void)|null>
}

export function usePopState({
    resolveFn,
    state,
    useUse,
    resolveUseFn
}: Props){
    const [promise, setPromise]=useState<Promise<void>|null>(null)
    if(promise){
        useUse.current = true
        use(promise)
    }else{
        useUse.current = false
    }
    useEffect(()=>{
        const handlePopstate=()=>{
            setPromise(
                new Promise<void>((resolve, reject)=>{
                    resolveFn.current = resolve
                    resolveUseFn.current = reject
                    state.current = 'exiting'
                }).then(()=>setPromise(null)).catch(()=>setPromise(null))
            )
        }
        window.addEventListener('popstate', handlePopstate)

        return()=>window.removeEventListener('popstate',handlePopstate)
    },[])
}