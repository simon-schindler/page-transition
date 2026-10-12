"use client"

import { useEffect, useState, use } from "react";

import type { RefObject } from "react";

interface Props{
    resolveFn: RefObject<(()=>void)|null>
    state: RefObject<'idle'|'exiting'|'entering'>
    popRun: RefObject<boolean>
}

export function usePopState({
    resolveFn,
    state,
    popRun
}: Props){
    const [promise, setPromise]=useState<Promise<void>|null>(null)
    if(promise){
        popRun.current = true
        use(promise)
        popRun.current = false
    }
    useEffect(()=>{
        const handlePopstate=()=>{
            setPromise(
                new Promise<void>((resolve)=>{
                    resolveFn.current = resolve
                    state.current = 'exiting'
                })
            )
        }
        window.addEventListener('popstate', handlePopstate)

        return()=>window.removeEventListener('popstate',handlePopstate)
    },[])
}