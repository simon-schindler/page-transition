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
        useUse.current = false
    }
    useEffect(()=>{
        const handlePopstate=()=>{
            setPromise(
                new Promise<void>((resolve)=>{
                    resolveFn.current = resolve
                    resolveUseFn.current = resolve
                    state.current = 'exiting'
                })
            )
        }
        window.addEventListener('popstate', handlePopstate)

        return()=>window.removeEventListener('popstate',handlePopstate)
    },[])
}