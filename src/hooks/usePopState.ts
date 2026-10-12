"use client"

import { useEffect, useRef, useState, use } from "react"

import type { RefObject } from "react"

import { useTransitionEndObj } from "./useTransitionEndObj"
import { transitionEnd } from "../functions/transitionEnd"

import { checkTransitionFinish } from "../functions/checkTransitionFinish"

interface TransitionEndData{
    elArray: (HTMLDivElement|null)[]
    propertyName: 'opacity'|'clip-path'
}
interface TransitionEndHandler {
    handler: ((e: TransitionEvent) => void) | null
    handlerEl: HTMLDivElement | null
}
interface Props{
    container: RefObject<HTMLDivElement|null>
    currentPathname: RefObject<string>
    transitionEndData: RefObject<TransitionEndData>
    transitionEndHandler: RefObject<TransitionEndHandler>
    reverse: RefObject<{_lock: boolean, lock: boolean}>
    delay: RefObject<number|null>
    state: RefObject<'idle'|'exiting'|'entering'|'navigating'>
    popRun: RefObject<boolean>
}
export function usePopState({
    container,
    currentPathname,
    transitionEndData,
    transitionEndHandler,
    reverse,
    delay,
    state,
    popRun
}:Props){

    const [promise, setPromise]=useState<null| Promise<void>>(null)
    
    if(promise){
        popRun.current =true
        
        use(promise)
        popRun.current =false
    }

    const resolveFn = useRef<(()=>void)|null>(null)
    const afterExitFn=useRef<(()=>void)|null>(null)
    
    const removeEnter=useTransitionEndObj({
        transitionEndData,
        fn: ()=>{
            container.current?.classList.remove('enter')
            state.current='idle'
            reverse.current.lock = true
        }
    })
    
    const afterExit = useTransitionEndObj({
        transitionEndData,
        fn: afterExitFn.current = ()=>{
            transitionEnd({
                transitionEndObj: removeEnter,
                transitionEndHandler,
                reverse,
                delay
            })
            
            container.current?.classList.remove('exit')
            container.current?.classList.add('enter')
            state.current='entering'
            reverse.current.lock = false
            
            resolveFn.current?.()
        }
    })
    
    const pop = useTransitionEndObj({
        transitionEndData,
        fn: ()=>{
            state.current = 'navigating'
            window.scrollTo(0,window.history.state.scrollY??0)
            
            resolveFn.current?.()
            
            resolveFn.current = null
        }
    })
    
    useEffect(()=>{
        
        const handlePopstate=()=>{
            setPromise(
                new Promise<void>((resolve)=>{
                    resolveFn.current = resolve
                    
                    new Promise<void>((resolveNavigating)=>{
                        
                        if(state.current === "navigating"){
                            
                            if(currentPathname.current !== window.location.pathname){

                                if(checkTransitionFinish(
                                transitionEndData.current,
                                ()=>{
                                    resolveFn.current?.()
                                }))return
                            }
                            else if(currentPathname.current === window.location.pathname){
                                
                                if(checkTransitionFinish(
                                transitionEndData.current,
                                afterExitFn.current
                                )){
                                    return
                                }else{
                                    resolveNavigating() 
                                }
                            }
                        }else{
                            resolveNavigating()
                        }
                    }).then(()=>{ 
                        if(currentPathname.current === window.location.pathname){
                            transitionEnd({
                                transitionEndObj: afterExit,
                                transitionEndHandler,
                                reverse,
                                delay
                            })

                            return
                        }
                        
                        transitionEnd({
                            transitionEndObj: pop, 
                            transitionEndHandler,
                            reverse,
                            delay
                        })

                        container.current?.classList.remove('enter')
                        container.current?.classList.add('exit')
                        
                        state.current='exiting'
                    }) 
                })
            )
        }
        window.addEventListener('popstate', handlePopstate)
        
        return()=>window.removeEventListener('popstate', handlePopstate)
    },[])  
}