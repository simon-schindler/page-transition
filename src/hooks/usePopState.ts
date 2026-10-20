"use client"

import { useEffect, useRef, useState, use } from "react"

import type { RefObject } from "react"

import { useTransitionEndObj } from "./useTransitionEndObj"
import { transitionEnd } from "../functions/transitionEnd"

import { pollTransitionStart } from "../functions/pollTransitionStart"

import { updatePlaybackRate } from "../functions/updatePlaybackRate"
import { setPlaybackRate } from "../functions/setPlaybackRate"

interface TransitionEndData{
    elArray: (HTMLDivElement|null)[]
    transitionProperty: 'opacity'|'clip-path'
    mirror: boolean
    mirrorElArray: (HTMLDivElement|null)[]
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
    delayStep: RefObject<number|null>
    state: RefObject<'idle'|'exiting'|'entering'|'navigating'>
    useUse: RefObject<boolean>
    resolveUseFn: RefObject<(()=>void)|null>
    pollRafId: RefObject<number|null>
}
export function usePopState({
    container,
    currentPathname,
    transitionEndData,
    transitionEndHandler,
    reverse,
    delayStep,
    state,
    useUse,
    resolveUseFn,
    pollRafId
}:Props){

    const [promise, setPromise]=useState<null| Promise<void>>(null)
    
    const rafId = useRef<number|null>(null)
    const rejectFn = useRef<(()=>void)|null>(null)
    
    if(promise){
        useUse.current = true
        use(promise)
    }else{
        useUse.current = false
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
                delayStep
            })
            
            state.current = 'navigating'
            container.current?.classList.remove('exit')
            container.current?.classList.add('enter')
            
            resolveFn.current?.()
            setPromise(null)
            useUse.current = false
            
            pollTransitionStart({
                id: pollRafId,
                transitionEndData,
                fn:()=>{
                    state.current='entering'
                    reverse.current.lock = false
                }
            })
        }
    })
    const pop = useTransitionEndObj({
        transitionEndData,
        fn: ()=>{
            state.current = 'navigating'
            window.scrollTo(0,window.history.state.scrollY??0)
            
            resolveFn.current?.()
            setPromise(null)
            useUse.current = false
        }
    })
    
    useEffect(()=>{
        
        const handlePopstate=()=>{
            
            setPromise(
                new Promise<void>((resolve, reject)=>{
                    resolveFn.current = resolve
                    resolveUseFn.current = reject
                    
                    new Promise<void>((resolveNavigating)=>{
                        
                        if(state.current === "navigating"){
                            if(currentPathname.current !== window.location.pathname){
                                resolveFn.current?.()
                                setPromise(null)
                                return
                            }
                            else if(currentPathname.current === window.location.pathname){
                                afterExitFn.current?.()
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
                                delayStep
                            })

                            return
                        }
                        if(state.current === 'entering'){
                            let elArray = []
                            if(transitionEndData.current.mirror){
                                elArray = [...transitionEndData.current.mirrorElArray, ...transitionEndData.current.elArray]
                            }else{
                                elArray = [...transitionEndData.current.elArray]
                            }
                            updatePlaybackRate({
                                rafId,
                                rejectFn,
                                elArray,
                                transitionProperty: transitionEndData.current.transitionProperty,
                                target: 0
                            }).then(()=>{
                                transitionEnd({
                                    transitionEndObj: pop, 
                                    transitionEndHandler,
                                    reverse,
                                    delayStep
                                })
                                container.current?.classList.remove('enter')
                                container.current?.classList.add('exit')
                                
                                state.current='exiting'

                                setPlaybackRate({
                                    elArray,
                                    transitionProperty: transitionEndData.current.transitionProperty,
                                    value: 0
                                })
                                updatePlaybackRate({
                                    rafId,
                                    rejectFn,
                                    elArray,
                                    transitionProperty: transitionEndData.current.transitionProperty,
                                    target: 1
                                }).catch(()=>{})
                                
                            }).catch(()=>{})
                            
                            return
                        }
                       
                        transitionEnd({
                            transitionEndObj: pop, 
                            transitionEndHandler,
                            reverse,
                            delayStep
                        })
                        
                        container.current?.classList.remove('enter')
                        container.current?.classList.add('exit')
                        
                        state.current='exiting'
                    }) 
                }).catch(()=>setPromise(null))
            )
        }
        window.addEventListener('popstate', handlePopstate)
        
        return()=>window.removeEventListener('popstate', handlePopstate)
    },[])  
}