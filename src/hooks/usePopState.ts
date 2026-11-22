"use client"

import { useEffect } from "react"
import { flushSync } from "react-dom"

import type { RefObject } from "react"

import { useAnimationEndObj } from "./useAnimationEndObj"
import { animationEnd } from "../functions/animationEnd"

import { dispatchNextPathname } from "../context/ActiveLinkContext"

import { useExitFinishContext } from "../context/ExitFinishContext"

import type { AnimationEndData, AnimationEndHandler } from "../types/animationEnd.types"
import type { Dispatch, SetStateAction } from "react"
interface Props{
    container: RefObject<HTMLDivElement|null>
    basePath: RefObject<string|null>
    animationEndData: RefObject<AnimationEndData>
    animationEndHandler: RefObject<AnimationEndHandler>
    state: RefObject<'idle'|'exiting'|'entering'|'navigating'>
    setVisible: Dispatch<SetStateAction<boolean>>
    setNewSnapshot: Dispatch<SetStateAction<number>>
}
export function usePopState({
    container,
    basePath,
    animationEndData,
    animationEndHandler,
    state,
    setVisible,
    setNewSnapshot
}:Props){

    const { setExitFinish }=useExitFinishContext()

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
                                    
                animationEnd({
                    animationEndObj: afterExit, 
                    animationEndHandler  
                })

                setVisible(true)
                
                container.current?.classList.remove('enter')
                container.current?.classList.add('exit')
                                    
                state.current='exiting'
            }
            else{

                animationEnd({
                    animationEndObj: afterEntering,
                    animationEndHandler 
                })
            }
        }
        window.addEventListener('popstate', handlePopstate)
        
        return()=>window.removeEventListener('popstate', handlePopstate)
    },[])  
}