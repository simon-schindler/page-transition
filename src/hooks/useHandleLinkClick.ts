"use client"

import { useCallback, useRef } from "react"
import { flushSync } from 'react-dom';

import { useRouter } from "next/navigation"

import type { Dispatch, RefObject, SetStateAction } from "react"

import { useAnimationEndObj } from "./useAnimationEndObj"

import { animationEnd } from "../functions/animationEnd"

import { dispatchNextPathname } from "../context/ActiveLinkContext"
import { useExitFinishContext } from "../context/ExitFinishContext"

import type { AnimationEndData, AnimationEndHandler } from "../types/animationEnd.types"

interface Props{
    container: RefObject<HTMLDivElement | null>
    handleLinkClick: RefObject<((e: React.MouseEvent,url:string)=>void)>
    basePath: RefObject<string|null>
    animationEndData: RefObject<AnimationEndData>
    animationEndHandler:RefObject<AnimationEndHandler>
    state: RefObject<'idle'|'exiting'|'entering'>
    setVisible: Dispatch<SetStateAction<boolean>>
    setNewSnapshot: Dispatch<SetStateAction<number>>
}
export function useHandleLinkClick({
    container,
    handleLinkClick,
    basePath,
    animationEndData,
    animationEndHandler,
    state,   
    setVisible,
    setNewSnapshot
}:Props){
    
    const router = useRouter()
    
    const nextPage = useRef<string|null>(null)
    const {setExitFinish}=useExitFinishContext()
    
    const afterExit = useAnimationEndObj({
        animationEndData,
        fn: ()=>{

            container.current?.classList.remove('exit')
            container.current?.classList.add('enter')
            
            flushSync(() => {
                setExitFinish(true)
            })
            
            setNewSnapshot(prev=>++prev)
            window.scrollTo(0, window.history.state.scrollY ?? 0)
            
            state.current='entering'
             
            animationEnd({
                animationEndObj:removeEnter,
                animationEndHandler
            })
        } 
    })
    
    const removeEnter = useAnimationEndObj({
        animationEndData,
        fn: ()=>{
            container.current?.classList.remove('enter')
            state.current='idle'
            setVisible(false)
        }
    })
    
    const afterEntering = useAnimationEndObj({
        animationEndData,
        fn: ()=>{
            animationEnd({
                animationEndObj: afterExit,
                animationEndHandler
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
                                
            animationEnd({
                animationEndObj: afterExit, 
                animationEndHandler  
            })

            setVisible(true)
                
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

            animationEnd({
                animationEndObj: afterEntering,
                animationEndHandler 
            })

            if(nextPage.current){
                setExitFinish(false)
                router.push(nextPage.current , { scroll: false })
                nextPage.current = null
            } 
        }
       
    },[router])
}
