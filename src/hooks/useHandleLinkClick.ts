"use client"

import { useCallback, useRef } from "react"
import { useRouter } from "next/navigation"

import type { RefObject } from "react"

import { useTransitionEndObj } from "../hooks/useTransitionEndObj"

import { transitionEnd } from "../functions/transitionEnd"

import { pollTransitionStart } from "../functions/pollTransitionStart"

import type { TransitionEndData, TransitionEndHandler } from "../types/transitionEnd.types"

interface Props{
    container: RefObject<HTMLDivElement | null>
    handleLinkClick: RefObject<((e: React.MouseEvent,url:string)=>void)>
    currentPathname: RefObject<string>
    transitionEndData: RefObject<TransitionEndData>
    transitionEndHandler:RefObject<TransitionEndHandler>
    state: RefObject<'idle'|'exiting'|'entering'|'navigating'>
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
    state, 
    useUse,
    resolveUseFn,
    basePath,
    pollRafId
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
        }
    })
    const afterExit = useTransitionEndObj({
        transitionEndData,
        fn: afterExitFn.current = ()=>{
            transitionEnd({
                transitionEndObj: removeEnter,
                transitionEndHandler
            })

            if(useUse.current){
                resolveUseFn.current?.()
                state.current='navigating'
                if(!nextPage.current)return
                router.push(nextPage.current)
            }

            state.current = 'navigating'
            container.current?.classList.remove('exit')
            container.current?.classList.add('enter')

            pollTransitionStart({
                id: pollRafId,
                transitionEndData,
                fn:()=>{
                    state.current='entering'
                }
            })

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
                transitionEndObj: push,
                transitionEndHandler
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

            if(state.current === 'idle' && 
                currentPathname.current === basePathUrl)return
                        
            if(currentPathname.current === basePathUrl 
                && state.current === 'exiting' ){
                transitionEnd({
                    transitionEndObj:afterExit,
                    transitionEndHandler
                })
                return
            }

            if(state.current === 'entering' && 
                currentPathname.current === basePathUrl
            ){
                transitionEnd({
                    transitionEndObj: removeEnter, 
                    transitionEndHandler
                })
                return
            }
                            
            if(state.current === 'idle'|| state.current === 'exiting'){
                                
                transitionEnd({
                    transitionEndObj: push, 
                    transitionEndHandler  
                })
                container.current?.classList.remove('enter')
                container.current?.classList.add('exit')
                                
                state.current='exiting'
            }
            else{
                transitionEnd({
                    transitionEndObj: afterEntering,
                    transitionEndHandler 
                })
            }
        })

    },[router])
}