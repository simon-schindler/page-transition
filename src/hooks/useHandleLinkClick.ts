"use client"

import { useCallback, useRef } from "react"
import { useRouter } from "next/navigation"

import type { RefObject } from "react"

import { useTransitionEndObj } from "../hooks/useTransitionEndObj"

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
    container: RefObject<HTMLDivElement | null>
    handleLinkClick: RefObject<((e: React.MouseEvent,url:string)=>void)>
    currentPathname: RefObject<string>
    transitionEndData: RefObject<TransitionEndData>
    transitionEndHandler:RefObject<TransitionEndHandler>
    state: RefObject<'idle'|'exiting'|'entering'|'navigating'>
    reverse: RefObject<{_lock: boolean, lock: boolean}>
    delayStep: RefObject<number|null>
    useUse: RefObject<boolean>
    resolveUseFn: RefObject<(()=>void)|null>
    basePath: RefObject<string|null>
    pollRafId: RefObject<number|null>
}
export function useHandleLinkClick({
    container,
    handleLinkClick,
    currentPathname,
    transitionEndData,
    transitionEndHandler,
    reverse,
    delayStep,
    state, 
    useUse,
    resolveUseFn,
    basePath,
    pollRafId
}:Props){
    
    const router = useRouter()
    const afterExitFn = useRef<(()=>void)|null>(null)
    const nextPage = useRef<string|null>(null)

    const rafId = useRef<number|null>(null)
    const rejectFn = useRef<(()=>void)|null>(null)

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
                delayStep
            })

            if(useUse.current){
                resolveUseFn.current?.()
                state.current='navigating'
                router.push(currentPathname.current)
            }

            state.current = 'navigating'
            container.current?.classList.remove('exit')
            container.current?.classList.add('enter')

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
    
    handleLinkClick.current = useCallback((e: React.MouseEvent, url:string)=>{
        e.preventDefault()
        
        nextPage.current = url
        const basePathUrl = basePath.current? basePath.current + url : url
        new Promise<void>((resolve)=>{
            if(state.current === 'navigating'){
                if(basePathUrl === currentPathname.current){   
                    return 
                }else if(basePathUrl !== currentPathname.current){
                    if(!nextPage.current)return

                    state.current = 'navigating'
                    router.push(nextPage.current)
                    nextPage.current = null
                        
                    return
                }
            }else{
                resolve()
            }
        }).then(()=>{

            if(basePathUrl === currentPathname.current){
                if(state.current !== 'exiting')return
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
                        transitionEndObj: push, 
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
                        target: 0
                    }).catch(()=>{})

                }).catch(()=>{})
                                        
                return
            }
            
            transitionEnd({
                transitionEndObj: push,
                transitionEndHandler,
                reverse,
                delayStep
            })
            
            container.current?.classList.remove('enter')
            container.current?.classList.add('exit')
            state.current='exiting'
            })
    },[router])
}