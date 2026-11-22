"use client"

import { useEffect } from "react"
import { flushSync } from "react-dom"

import type { RefObject } from "react"

import { useTransitionEndObj } from "./useTransitionEndObj"
import { transitionEnd } from "../functions/transitionEnd"

import { pollTransitionStart } from "../functions/pollTransitionStart"
import { dispatchNextPathname } from "../context/ActiveLinkContext"

import { useExitFinishContext } from "../context/ExitFinishContext"

import type { TransitionEndData, TransitionEndHandler } from "../types/transitionEnd.types"
import type { Dispatch, SetStateAction } from "react"
interface Props{
    container: RefObject<HTMLDivElement|null>
    basePath: RefObject<string|null>
    transitionEndData: RefObject<TransitionEndData>
    transitionEndHandler: RefObject<TransitionEndHandler>
    state: RefObject<'idle'|'exiting'|'entering'|'navigating'>
    pollRafId: RefObject<number|null> 
    setVisible: Dispatch<SetStateAction<boolean>>
    setNewSnapshot: Dispatch<SetStateAction<number>>
}
export function usePopState({
    container,
    basePath,
    transitionEndData,
    transitionEndHandler,
    state,
    pollRafId,
    setVisible,
    setNewSnapshot
}:Props){

    const { setExitFinish }=useExitFinishContext()

    const afterExit = useTransitionEndObj({
        transitionEndData,
        fn: ()=>{
    
            container.current?.classList.remove('exit')
            container.current?.classList.add('enter')
                
            flushSync(() => {
                setExitFinish(true)
            })
            setNewSnapshot(prev=>++prev)
            window.scrollTo(0, window.history.state.scrollY ?? 0)
                
            pollTransitionStart({
                id: pollRafId,
                transitionEndData,
                fn:()=>{
                    state.current='entering'
                }
            })
                
            transitionEnd({
                transitionEndObj:removeEnter,
                transitionEndHandler
            })
        } 
    })
        
    const removeEnter = useTransitionEndObj({
        transitionEndData,
        fn: ()=>{
            container.current?.classList.remove('enter')
            state.current='idle'
            setVisible(false)
        }
    })
        
    const afterEntering = useTransitionEndObj({
        transitionEndData,
        fn: ()=>{
            transitionEnd({
                transitionEndObj: afterExit,
                transitionEndHandler
             })  
    
            container.current?.classList.remove('enter')
            void container.current?.offsetWidth
            container.current?.classList.add('exit')
    
            state.current='exiting'
        }
    })
   
    useEffect(()=>{
        const handlePopstate=()=>{
            const nextPathname = window.location.pathname.slice(basePath.current?.length??0)
            dispatchNextPathname(nextPathname)
            setVisible(true)
            
                   
            if(state.current === 'idle'|| state.current === 'exiting'){
                                    
                transitionEnd({
                    transitionEndObj: afterExit, 
                    transitionEndHandler  
                })

                setVisible(true)
                state.current = 'navigating'
                    
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
        }
        window.addEventListener('popstate', handlePopstate)
        
        return()=>window.removeEventListener('popstate', handlePopstate)
    },[])  
}