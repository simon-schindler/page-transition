"use client"

import {TransitionContext} from "./TransitionContext"

import { useRef, useMemo, useEffect} from "react";
import { usePathname } from "next/navigation";

import type { ReactNode } from "react";

import { useTransitionEndHandler } from "../hooks/useTransitionEndHandler";
import { useTransitionEndData } from "../hooks/useTransitionEndData";
import { useTransitionEndObj } from "../hooks/useTransitionEndObj";
import { transitionEnd } from "../functions/transitionEnd";

import { useHandleLinkClick } from "../hooks/useHandleLinkClick";
import { useScrollRestoration } from "../hooks/useScrollRestoration";
import { usePopState } from "../hooks/usePopState";

import { parseDelay } from "../functions/parseDelay";
import { parseDuration } from "../functions/parseDuration";
import { pollTransitionStart } from "../functions/pollTransitionStart"; 

interface TransitionOptions{
    transitionProperty?: 'opacity'|'clip-path'
    wait?: boolean
    items?: [number, number]
}
interface DefaultOptions{
    transitionProperty: 'opacity'|'clip-path'
    wait: boolean
    items: [number, number]
}
interface ProviderProps{
    header?:ReactNode
    options?:TransitionOptions
    children:ReactNode,
}

export function CssTransitionProvider({
    header, 
    options, 
    children
}:ProviderProps){

    const defaultOptions:DefaultOptions = {
        transitionProperty: 'opacity',
        wait: false,
        items: [0, 0],
        ...options
    }

    const container = useRef<HTMLDivElement|null>(null)
    const overlayWrapper = useRef<HTMLDivElement|null>(null)
    const overlayItems = useRef<(HTMLDivElement|null)[]>([])
    const secondItems = useRef<(HTMLDivElement|null)[]>([])
    
    const pathname = usePathname()
    const currentPathname = useRef(pathname)
    
    const mount=useRef({
        mounted: false,
        initPathname: pathname
    })
    
    const state = useRef<'idle'|'exiting'|'navigating'|'entering'>('idle')
    const basePath = useRef<string|null>(null)
    
    const useUse = useRef(false)
    const resolveUseFn = useRef<(()=>void)|null>(null)
    
    const reverse = useRef({
        _lock: true,
        get lock(){
            return this._lock
        },
        set lock(value: boolean){
            if(delayStep.current === 0 || 
                overlayItems.current.length < 2 ||
            defaultOptions.wait === true){
                if(this._lock === false)this._lock = true
                return
            }
            this._lock = value
        }
    })

    const delayStep = useRef<number|null>(null)
    const duration = useRef<number|null>(null)

    const handleLinkClick = useRef<((e: React.MouseEvent, url:string)=>void)>(()=>{})

    const transitionEndHandler = useTransitionEndHandler()
    const transitionEndData = useTransitionEndData({
        elArray: defaultOptions.items[0] === 0 ? container : overlayItems,
        transitionProperty: defaultOptions.transitionProperty,
        secondElArray: secondItems
    })

    const pollRafId = useRef<number|null>(null)

    const rafId = useRef<number|null>(null)
    const rejectFn = useRef<(()=>void)|null>(null)
    
    usePopState({
        container,
        currentPathname,
        transitionEndData,
        transitionEndHandler,
        state,
        reverse,
        useUse,
        resolveUseFn,
        pollRafId,
        rafId,
        rejectFn,
        delayStep,
        duration,
        wait: defaultOptions.wait
    })
    useHandleLinkClick({
        container,
        handleLinkClick,
        currentPathname,
        transitionEndData,
        transitionEndHandler,
        state,
        reverse,
        useUse,
        resolveUseFn,
        basePath,
        pollRafId,
        rafId,
        rejectFn,
        delayStep,
        duration,
        wait: defaultOptions.wait
    })
    useScrollRestoration()

    const removeEnter=useTransitionEndObj({
        transitionEndData,
        fn:()=>{
            container.current?.classList.remove('enter')
            state.current = 'idle'
            reverse.current.lock = true
        }
    })
    
    useEffect(()=>{
        if(mount.current.mounted === false && 
            mount.current.initPathname === pathname
        ){
            currentPathname.current = window.location.pathname
            basePath.current = window.location.pathname.slice(0, -pathname.length)
            return
        }
        mount.current.mounted = true
        
        if(!container.current)return
        
        transitionEnd({
            transitionEndObj: removeEnter,
            transitionEndHandler,
            reverse,
            delayStep
        })
            
        container.current.classList.remove('exit')
        container.current.classList.add('enter')
        
        pollTransitionStart({
            transitionEndData, 
            id: pollRafId, 
            fn: ()=>{
                state.current = 'entering'
            }
        })
        
        currentPathname.current = window.location.pathname
        
        reverse.current.lock = false

        if(delayStep.current === null && defaultOptions.items[0] > 1){
            delayStep.current = defaultOptions.wait? 0 :
            parseDelay(transitionEndData.current.elArray)
        }
        if(duration.current === null && !defaultOptions.wait){
            duration.current = parseDuration(transitionEndData.current.elArray[0])*1000/3
        }
    },[pathname])
      
    const value=useMemo(()=>({handleLinkClick, overlayWrapper, overlayItems}),[])

    return(
        <TransitionContext.Provider value={value}>
            {
                header
            }
            <div 
            ref={container}
            data-transition
            >
                <div 
                ref={overlayWrapper}
                className="overlay-wrapper"
                >
                    {
                        defaultOptions.items[0] > 0 && Array.from({length: defaultOptions.items[0]}).map((_,i)=>(
                            <div 
                            key={i}
                            ref={(el)=>{
                                overlayItems.current[i]=el
                            }}
                            className="overlay-item"/>
                        ))
                    }
                    {
                        defaultOptions.items[1] > 0 && Array.from({length:defaultOptions.items[1]}).map((_,i)=>(
                            <div
                            key={`mirror${i}`}
                            ref={(el)=>{
                                secondItems.current[i] = el
                            }}
                            className="mirror-item"
                            />
                        ))
                    }
                </div>
                {children}
            </div>
        </TransitionContext.Provider>
    )
}