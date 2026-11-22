"use client"

import { useEffect, useRef } from "react";
import { dispatchNextPathname } from "../../context/ActiveLinkContext";
import { useExitFinishContext } from "../../context/ExitFinishContext"
import type { RefObject, Dispatch, SetStateAction } from "react";

interface Props{
    resolveFn: RefObject<(()=>void)|null>
    rejectFn: RefObject<(()=>void) |null>
    state: RefObject<'idle'|'exiting'|'entering'>
    basePath: RefObject<string|null>
    setVisible: Dispatch<SetStateAction<boolean>>
    setNewSnapshot: Dispatch<SetStateAction<number>> 
}

export function usePopState({
    resolveFn,
    rejectFn,
    state,
    basePath,
    setVisible,
    setNewSnapshot
}: Props){
    
    const promise =useRef<null| Promise<void>>(null)
    const { setExitFinish } = useExitFinishContext()
    
    useEffect(()=>{
        const handlePopstate=()=>{
            
            rejectFn.current?.()

            const nextPathname = window.location.pathname.slice(basePath.current?.length??0)
            dispatchNextPathname(nextPathname)
            setExitFinish(false)
            setVisible(true)
            
            promise.current = new Promise<void>((resolve, reject)=>{
                rejectFn.current = reject
                resolveFn.current = resolve
                
                state.current = 'exiting'
            }).then(()=>{
                setExitFinish(true)
                setVisible(false)
                setNewSnapshot(prev=>++prev)
                promise.current = null
                window.scrollTo(0, window.history.state.scrollY ?? 0)

                state.current = 'entering'
                resolveFn.current = null
            }).catch(()=>{
                promise.current = null
            })
 
        }
        window.addEventListener('popstate', handlePopstate)

        return()=>window.removeEventListener('popstate',handlePopstate)
    },[])
}