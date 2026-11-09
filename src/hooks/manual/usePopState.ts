"use client"

import { useEffect, useState, useRef, use } from "react";
import { dispatchNextPathname } from "../../context/ActiveLinkContext";

import type { RefObject } from "react";

interface Props{
    resolveFn: RefObject<(()=>void)|null>
    state: RefObject<'idle'|'exiting'|'entering'>
    currentPathname: RefObject<string>
    basePath: RefObject<string|null>
    useUse: RefObject<boolean>
    resolveUseFn: RefObject<(()=>void)|null>
}

export function usePopState({
    resolveFn,
    state,
    currentPathname,
    basePath,
    useUse,
    resolveUseFn
}: Props){
    const [_, rerender]=useState<number>(0)
    const promise =useRef<null| Promise<void>>(null)
    
    if(promise.current){
        useUse.current = true
        use(promise.current)
    }else{
        useUse.current = false
    }

    useEffect(()=>{
        const handlePopstate=()=>{
            
            const nextPathname = window.location.pathname.slice(basePath.current?.length??0)
            dispatchNextPathname(nextPathname)
            
            promise.current = new Promise<void>((resolve, reject)=>{

                resolveFn.current = resolve
                resolveUseFn.current = reject
                state.current = 'exiting'
            }).then(()=>{

                promise.current = null
                if(window.location.pathname === currentPathname.current){
                    state.current = 'entering'
                }
            }).catch(()=>{
                promise.current = null
            })

            rerender((prev)=>++prev) 
            
        }
        window.addEventListener('popstate', handlePopstate)

        return()=>window.removeEventListener('popstate',handlePopstate)
    },[])
}