"use client"

import { useCallback, useRef } from "react"
import { useRouter } from "next/navigation"

import type { RefObject } from "react"

import { useTransitionEndObj } from "../hooks/useTransitionEndObj"

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
    container: RefObject<HTMLDivElement | null>
    handleLinkClick: RefObject<((e: React.MouseEvent,url:string)=>void)>
    currentPathname: RefObject<string>
    transitionEndData: RefObject<TransitionEndData>
    transitionEndHandler:RefObject<TransitionEndHandler>
    state: RefObject<'idle'|'exiting'|'entering'|'navigating'>
    reverse: RefObject<{_lock: boolean, lock: boolean}>
    delay: RefObject<number|null>
    useUse: RefObject<boolean>
    resolveUseFn: RefObject<(()=>void)|null>
}
export function useHandleLinkClick({
    container,
    handleLinkClick,
    currentPathname,
    transitionEndData,
    transitionEndHandler,
    reverse,
    delay,
    state, 
    useUse,
    resolveUseFn
}:Props){
    
    const router = useRouter()
    const afterExitFn = useRef<(()=>void)|null>(null)
    const nextPage = useRef<string|null>(null)

    const push = useTransitionEndObj({
        transitionEndData,
        fn: ()=>{
            if(!nextPage.current)return
            if(useUse.current)resolveUseFn.current?.()
            
            state.current = 'navigating'
            router.push(nextPage.current)
            nextPage.current = null
        } 
    })
    const removeEnter = useTransitionEndObj({
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

            if(useUse.current){
                resolveUseFn.current?.()
                state.current='navigating'
                router.push(currentPathname.current)
            }
            
            
            container.current?.classList.remove('exit')
            container.current?.classList.add('enter')
            reverse.current.lock = false
            state.current='entering'
        }
    })
    
    handleLinkClick.current = useCallback((e: React.MouseEvent, url:string)=>{
        e.preventDefault()
        
        nextPage.current = url
        new Promise<void>((resolve)=>{
            if(state.current === 'navigating'){
                if(url === currentPathname.current){
                    
                    return 
                }else if(url !== currentPathname.current){
                    if(checkTransitionFinish(
                        transitionEndData.current,
                        ()=>{
                            if(!nextPage.current)return
                            state.current = 'navigating'
                            router.push(nextPage.current)
                            nextPage.current = null
                        }
                    ))return
                    resolve()
                }
            }else{
                resolve()
            }
        }).then(()=>{

            if(url === currentPathname.current){
                if(state.current !== 'exiting')return
                transitionEnd({
                    transitionEndObj: afterExit,
                    transitionEndHandler,
                    reverse,
                    delay
                })
                
                return
            }
            
            transitionEnd({
                transitionEndObj: push,
                transitionEndHandler,
                reverse,
                delay
            })
            
            container.current?.classList.remove('enter')
            container.current?.classList.add('exit')
            state.current='exiting'
            })
    },[router])
}