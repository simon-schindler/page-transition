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
    mirrorElArray: (HTMLDivElement|null)[],
    delayStep: number
    duration: number
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
    state: RefObject<'idle'|'exiting'|'entering'|'navigating'>
    useUse: RefObject<boolean>
    resolveUseFn: RefObject<(()=>void)|null>
    pollRafId: RefObject<number|null>
    rafId: RefObject<number|null>
    rejectFn: RefObject<(()=>void)|null>
}
export function usePopState({
    container,
    currentPathname,
    transitionEndData,
    transitionEndHandler,
    reverse,
    state,
    useUse,
    resolveUseFn,
    pollRafId,
    rafId,
    rejectFn
}:Props){

    const [promise, setPromise]=useState<null| Promise<void>>(null)
    
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
                reverse
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

    const afterEntering = useTransitionEndObj({
        transitionEndData,
        fn: ()=>{

            if(rafId.current){
                cancelAnimationFrame(rafId.current)
                rafId.current = null
            }
            rejectFn.current?.()
            
            container.current?.classList.remove('enter')
            
            requestAnimationFrame(()=>{
                requestAnimationFrame(()=>{
                    container.current?.classList.add('exit')
                })
            })
            
            state.current='exiting'
            transitionEnd({
                transitionEndObj: pop,
                transitionEndHandler,
                reverse
            })  
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
                            console.log('navigating')
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
                        console.log('not navigating')
                        if(currentPathname.current === window.location.pathname){
                            
                            transitionEnd({
                                transitionEndObj: afterExit,
                                transitionEndHandler,
                                reverse
                            })

                            return
                        }
                        if(state.current === 'entering'){
                            transitionEnd({
                                transitionEndObj: afterEntering,
                                transitionEndHandler,
                                reverse
                            })
                            
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
                                target: 0,
                                duration: transitionEndData.current.duration
                            }).then(()=>{
                                
                                transitionEnd({
                                    transitionEndObj: pop, 
                                    transitionEndHandler,
                                    reverse
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
                                    target: 1,
                                    duration: transitionEndData.current.duration
                                }).catch(()=>{})
                                
                            }).catch(()=>{})
                            
                            return
                        }
                       
                        transitionEnd({
                            transitionEndObj: pop, 
                            transitionEndHandler,
                            reverse
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