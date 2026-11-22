"use client"

import { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { dispatchNextPathname } from "../../context/ActiveLinkContext";
import { useExitFinishContext } from "../../context/ExitFinishContext";

import type { RefObject, Dispatch, SetStateAction } from "react";

interface Props{
    handleLinkClick: RefObject<((e: React.MouseEvent, url: string)=>void)>
    resolveFn: RefObject<(()=>void)|null>
    rejectFn: RefObject<(()=>void) |null>
    state: RefObject<'idle'|'exiting'|'entering'>
    basePath: RefObject<string|null>
    setVisible: Dispatch<SetStateAction<boolean>>
    setNewSnapshot: Dispatch<SetStateAction<number>> 
}

export function useHandleLinkClick({
    handleLinkClick,
    resolveFn,
    rejectFn,
    state,
    basePath,
    setVisible,
    setNewSnapshot
}:Props){
    
    const router = useRouter()
    const promise =useRef<null| Promise<void>>(null)
    const { setExitFinish } = useExitFinishContext()
    
    handleLinkClick.current = useCallback((e, url)=>{
        e.preventDefault()
        
        rejectFn.current?.()

        dispatchNextPathname(url)
       
        const basePathUrl = basePath.current? basePath.current + url : url
        if(basePathUrl === window.location.pathname)return
        
        setExitFinish(false)
        setVisible(true)
        router.push(url,{ scroll: false })

        promise.current = new Promise<void>((resolve, reject)=>{
            rejectFn.current = reject
            resolveFn.current = resolve
            state.current = 'exiting'

        }).then(()=>{
            setExitFinish(true)
            setVisible(false)
            setNewSnapshot(prev=>++prev)
            window.scrollTo(0, window.history.state.scrollY ?? 0)

            state.current = 'entering'
            resolveFn.current = null
        }).catch(()=>{
            console.log('catch')
            promise.current = null
        })
    },[])
}