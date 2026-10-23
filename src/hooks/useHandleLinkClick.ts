"use client"

import { useCallback, useRef } from "react"
import { useRouter } from "next/navigation"

import type { RefObject } from "react"

import { useTransitionEndObj } from "../hooks/useTransitionEndObj"

import { transitionEnd } from "../functions/transitionEnd"

import { pollTransitionStart } from "../functions/pollTransitionStart"

import { updatePlaybackRate } from "../functions/updatePlaybackRate"
import { setPlaybackRate } from "../functions/setPlaybackRate"

import type { TransitionEndData, TransitionEndHandler } from "../types/transitionEnd.types"

interface Props{
    container: RefObject<HTMLDivElement | null>
    handleLinkClick: RefObject<((e: React.MouseEvent,url:string)=>void)>
    currentPathname: RefObject<string>
    transitionEndData: RefObject<TransitionEndData>
    transitionEndHandler:RefObject<TransitionEndHandler>
    state: RefObject<'idle'|'exiting'|'entering'|'navigating'>
    reverse: RefObject<{_lock: boolean, lock: boolean}>
    useUse: RefObject<boolean>
    resolveUseFn: RefObject<(()=>void)|null>
    basePath: RefObject<string|null>
    pollRafId: RefObject<number|null>
    rafId: RefObject<number|null>
    rejectFn: RefObject<(()=>void)|null>
    delayStep: RefObject<number|null>
    duration: RefObject<number|null>
    wait: boolean
}
export function useHandleLinkClick({
    container,
    handleLinkClick,
    currentPathname,
    transitionEndData,
    transitionEndHandler,
    reverse,
    state, 
    useUse,
    resolveUseFn,
    basePath,
    pollRafId,
    rafId,
    rejectFn,
    delayStep,
    duration,
    wait
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
    const afterEntering = useTransitionEndObj({
        transitionEndData,
        fn: ()=>{
            
            if(rafId.current){
                cancelAnimationFrame(rafId.current)
                rafId.current = null
            }
            rejectFn.current?.()
            
            container.current?.classList.remove('enter')
            void container.current?.offsetWidth
            container.current?.classList.add('exit')
             
            state.current='exiting'

            transitionEnd({
                transitionEndObj: push,
                transitionEndHandler,
                reverse,
                delayStep
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

            if(wait){
                if(state.current === 'idle' && 
                    currentPathname.current === basePathUrl)return
                        
                if(currentPathname.current === basePathUrl 
                    && state.current === 'exiting' ){
                    transitionEnd({
                        transitionEndObj:afterExit,
                        transitionEndHandler,
                        reverse,
                        delayStep
                    })
                    return
                }

                if(state.current === 'entering' && 
                    currentPathname.current === basePathUrl
                ){
                    transitionEnd({
                        transitionEndObj: removeEnter, 
                        transitionEndHandler,
                        reverse,
                        delayStep
                    })
                    return
                }
                            
                if(state.current === 'idle'|| state.current === 'exiting'){
                                
                    transitionEnd({
                        transitionEndObj: push, 
                        transitionEndHandler,
                        reverse,
                        delayStep
                    })
                    container.current?.classList.remove('enter')
                    container.current?.classList.add('exit')
                                
                    state.current='exiting'
                }
                else{
                    transitionEnd({
                        transitionEndObj: afterEntering,
                        transitionEndHandler,
                        reverse,
                        delayStep
                    })
                }
                            
                return
            }

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
                
                transitionEnd({
                    transitionEndObj: afterEntering, 
                    transitionEndHandler,
                    reverse,
                    delayStep
                })
                
                let elArray = []
                if(transitionEndData.current.secondElArray.length > 0){
                    elArray = [...transitionEndData.current.secondElArray, ...transitionEndData.current.elArray]
                }else{
                    elArray = [...transitionEndData.current.elArray]
                }
                updatePlaybackRate({
                    rafId,
                    rejectFn,
                    elArray,
                    transitionProperty: transitionEndData.current.transitionProperty,
                    target: 0,
                    duration: duration.current ?? 0
                }).then(()=>{
                    if(nextPage.current === currentPathname.current){
                        transitionEnd({
                            transitionEndObj: afterExit, 
                            transitionEndHandler,
                            reverse,
                            delayStep
                        })
                    }else{
                        transitionEnd({
                            transitionEndObj: push, 
                            transitionEndHandler,
                            reverse,
                            delayStep
                        })
                    }
                    

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
                        duration: duration.current ?? 0
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