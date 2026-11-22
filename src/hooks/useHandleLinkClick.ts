"use client"

import { useCallback, useRef } from "react"
import { flushSync } from 'react-dom';

import { useRouter } from "next/navigation"

import type { Dispatch, RefObject, SetStateAction } from "react"

import { useTransitionEndObj } from "../hooks/useTransitionEndObj"

import { transitionEnd } from "../functions/transitionEnd"

import { pollTransitionStart } from "../functions/pollTransitionStart"
import { dispatchNextPathname } from "../context/ActiveLinkContext"
import { useExitFinishContext } from "../context/ExitFinishContext"

import type { TransitionEndData, TransitionEndHandler } from "../types/transitionEnd.types"

interface Props{
    container: RefObject<HTMLDivElement | null>
    handleLinkClick: RefObject<((e: React.MouseEvent,url:string)=>void)>
    basePath: RefObject<string|null>
    transitionEndData: RefObject<TransitionEndData>
    transitionEndHandler:RefObject<TransitionEndHandler>
    state: RefObject<'idle'|'exiting'|'entering'|'navigating'>
    pollRafId: RefObject<number|null>
    setVisible: Dispatch<SetStateAction<boolean>>
    setNewSnapshot: Dispatch<SetStateAction<number>>
}
export function useHandleLinkClick({
    container,
    handleLinkClick,
    basePath,
    transitionEndData,
    transitionEndHandler,
    state,   
    pollRafId,
    setVisible,
    setNewSnapshot
}:Props){
    
    const router = useRouter()
    
    const nextPage = useRef<string|null>(null)
    const {setExitFinish}=useExitFinishContext()
    
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
    
    handleLinkClick.current = useCallback((e: React.MouseEvent, url:string)=>{
        e.preventDefault()
        
        dispatchNextPathname(url)
        nextPage.current = url
        const basePathUrl = basePath.current? basePath.current + url : url
        
        if(state.current === 'idle' && 
            window.location.pathname === basePathUrl ||
            state.current === 'entering' && 
            window.location.pathname === basePathUrl
        )return
                   
        if(state.current === 'idle'|| state.current === 'exiting'){
                                
            transitionEnd({
                transitionEndObj: afterExit, 
                transitionEndHandler  
            })

            setVisible(true)
            state.current = 'navigating'
                
            if(nextPage.current){
                setExitFinish(false)
                router.push(nextPage.current, { scroll: false })
                nextPage.current = null
            } 
                
            container.current?.classList.remove('enter')
            container.current?.classList.add('exit')
                                
            state.current='exiting'
        }
        else{

            transitionEnd({
                transitionEndObj: afterEntering,
                transitionEndHandler 
            })

            if(nextPage.current){
                setExitFinish(false)
                router.push(nextPage.current , { scroll: false })
                nextPage.current = null
            } 
        }
       
    },[router])
}
