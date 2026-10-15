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

interface TransitionOptions{
    transitionProperty?: 'opacity'|'clip-path'
    overlayCount?: number
}
interface DefaultOptions{
    transitionProperty: 'opacity'|'clip-path'
    overlayCount: number
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
        overlayCount: 0,
        ...options
    }

    const container = useRef<HTMLDivElement|null>(null)
    const overlayWrapper = useRef<HTMLDivElement|null>(null)
    const overlayItems = useRef<(HTMLDivElement|null)[]>([])
    
    const pathname = usePathname()
    const currentPathname = useRef(pathname)
    
    const mount=useRef({
        mounted: false,
        initPathname: pathname
    })
    
    const state = useRef<'idle'|'exiting'|'navigating'|'entering'>('idle')
    
    const useUse = useRef(false)
    const resolveUseFn = useRef<(()=>void)|null>(null)
    
    const reverse = useRef({
        _lock: true,
        get lock(){
            return this._lock
        },
        set lock(value: boolean){
            if(delay.current === 0 || overlayItems.current.length < 2){
                if(this._lock === false)this._lock = true
                return
            }
            this._lock = value
        }
    })
    const delay= useRef<number|null>(null)

    const handleLinkClick = useRef<((e: React.MouseEvent, url:string)=>void)>(()=>{})

    const transitionEndHandler = useTransitionEndHandler()
    const transitionEndData = useTransitionEndData({
        elArray: defaultOptions.overlayCount === 0 ? container : overlayItems,
        transitionProperty: defaultOptions.transitionProperty
    })
    
    usePopState({
        container,
        currentPathname,
        transitionEndData,
        transitionEndHandler,
        state,
        reverse,
        delay,
        useUse,
        resolveUseFn
    })
    useHandleLinkClick({
        container,
        handleLinkClick,
        currentPathname,
        transitionEndData,
        transitionEndHandler,
        state,
        reverse,
        delay,
        useUse,
        resolveUseFn
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
            return
        }
        mount.current.mounted = true

        if(delay.current === null){
            delay.current = parseDelay(transitionEndData.current.elArray)
        }

        if(!container.current)return
        
        transitionEnd({
                transitionEndObj: removeEnter,
                transitionEndHandler,
                reverse,
                delay
        })
            
        container.current.classList.remove('exit')
        container.current.classList.add('enter')
        
        currentPathname.current = pathname
        state.current = 'entering'

        reverse.current.lock = false
        
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
                        Array.from({length: defaultOptions.overlayCount}).map((_,i)=>(
                            <div 
                            key={i}
                            ref={(el)=>{
                                overlayItems.current[i]=el
                            }}
                            className="overlay-item"/>
                        ))
                    }
                </div>
                {children}
            </div>
        </TransitionContext.Provider>
    )
}