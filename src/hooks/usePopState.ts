"use client"

import { useEffect, useRef, useState, use } from "react"

import type { Dispatch, RefObject, SetStateAction } from "react"

import { useTransitionEndObj } from "./useTransitionEndObj"
import { transitionEnd } from "../functions/transitionEnd"

import { pollTransitionStart } from "../functions/pollTransitionStart"

import type { TransitionEndData, TransitionEndHandler } from "../types/transitionEnd.types"

interface Props{
    container: RefObject<HTMLDivElement|null>
    currentPathname: RefObject<string>
    transitionEndData: RefObject<TransitionEndData>
    transitionEndHandler: RefObject<TransitionEndHandler>
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
    state,
    useUse,
    resolveUseFn,
    pollRafId
}:Props){

    const [_, rerender]=useState<number>(0)
    const promise =useRef<null| Promise<void>>(null)

    if(promise.current){
        useUse.current = true
        use(promise.current)
    }else{
        useUse.current = false
    }
        

    const resolveFn = useRef<(()=>void)|null>(null)
    const afterExitFn = useRef<(()=>void)|null>(null)
    
    const removeEnter=useTransitionEndObj({
        transitionEndData,
        fn: ()=>{
            container.current?.classList.remove('enter')
            state.current='idle'
        }
    })
    const afterExit = useTransitionEndObj({
        transitionEndData,
        fn: afterExitFn.current = ()=>{
            transitionEnd({
                transitionEndObj: removeEnter,
                transitionEndHandler 
            })
            
            state.current = 'navigating'
            container.current?.classList.remove('exit')
            container.current?.classList.add('enter')
            
            resolveFn.current?.()
            
            promise.current=null
            useUse.current = false
            
            pollTransitionStart({
                id: pollRafId,
                transitionEndData,
                fn:()=>{
                    state.current='entering'
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
            
            promise.current=null
            useUse.current = false
        }
    })

    const afterEntering = useTransitionEndObj({
        transitionEndData,
        fn: ()=>{

            container.current?.classList.remove('enter')
            void container.current?.offsetWidth
            container.current?.classList.add('exit')
            state.current='exiting'

            transitionEnd({
                transitionEndObj: pop,
                transitionEndHandler
            })  
        }
    })
   
    useEffect(()=>{
        const handlePopstate=()=>{
            
            promise.current = new Promise<void>((resolve, reject)=>{

                resolveFn.current = resolve
                resolveUseFn.current = reject
                    
                new Promise<void>((resolveNavigating)=>{
  
                    if(state.current === "navigating"){
                            
                        if(currentPathname.current !== window.location.pathname){
                            state.current = 'navigating'
                            resolveFn.current?.()
                                
                            promise.current=null
                            return
                        }
                        else if(currentPathname.current === window.location.pathname){
                            afterExitFn.current?.()
                        }
                    }else{
                        resolveNavigating()
                    }
                }).then(()=>{

                    if(currentPathname.current === window.location.pathname 
                        && state.current === 'exiting' ){
                        transitionEnd({
                            transitionEndObj:afterExit,
                            transitionEndHandler
                        })
                        return
                        }

                    if(state.current === 'entering' && 
                        currentPathname.current === window.location.pathname
                    ){
                        transitionEnd({
                            transitionEndObj: removeEnter, 
                            transitionEndHandler
                        })
                        return
                    }
                            
                    if(state.current === 'idle'|| state.current === 'exiting'){
                                
                        transitionEnd({
                            transitionEndObj: pop, 
                            transitionEndHandler     
                        })

                        container.current?.classList.remove('enter')
                        container.current?.classList.add('exit')
                                
                        state.current='exiting'

                    }else{
                        transitionEnd({
                            transitionEndObj: afterEntering,
                            transitionEndHandler
                        })
                    }
                })             
            }).catch(()=>{
                promise.current=null
            })
            
            rerender((prev)=>++prev)
            
        }
        window.addEventListener('popstate', handlePopstate)
        
        return()=>window.removeEventListener('popstate', handlePopstate)
    },[])  
}