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

import { pollTransitionStart } from "../functions/pollTransitionStart"; 

import type { TransitionProperty } from "../types/transitionPropertys.types";

interface TransitionOptions{
    transitionProperty: TransitionProperty
    items?: [number, number]
}
interface DefaultOptions{
    transitionProperty: TransitionProperty
    items: [number, number]
}
interface ProviderProps{
    outside?: ReactNode
    options: TransitionOptions
    children: ReactNode
}

export function CssTransitionProvider({ 
    outside,
    options, 
    children
}:ProviderProps){

    const defaultOptions:DefaultOptions = {
        items: [0, 0],
        ...options
    }

    const container = useRef<HTMLDivElement|null>(null)
    const pageWrapper = useRef<HTMLDivElement|null>(null)
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
    
    const handleLinkClick = useRef<((e: React.MouseEvent, url:string)=>void)>(()=>{})

    const transitionEndHandler = useTransitionEndHandler()
    const transitionEndData = useTransitionEndData({
        elArray: defaultOptions.items[0] === 0 ? pageWrapper : overlayItems,
        transitionProperty: defaultOptions.transitionProperty,
        secondElArray: secondItems
    })

    const pollRafId = useRef<number|null>(null)

    usePopState({
        container,
        currentPathname,
        transitionEndData,
        transitionEndHandler,
        state,
        useUse,
        resolveUseFn,
        pollRafId
    })
    useHandleLinkClick({
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
    })
    useScrollRestoration()

    const removeEnter=useTransitionEndObj({
        transitionEndData,
        fn:()=>{
            container.current?.classList.remove('enter')
            state.current = 'idle'
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
            transitionEndHandler
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
        
    },[pathname])
      
    const value=useMemo(()=>({handleLinkClick, overlayWrapper, overlayItems}),[])

    return(
        <TransitionContext.Provider value={value}>
            <div 
            ref={container}
            data-transition
            >
                {outside}
                {
                    (defaultOptions.items[0] > 0 ||  defaultOptions.items[1] > 0) && 
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
                                className="second-item"
                                />
                            ))
                        }
                    </div>
                }
                <div 
                ref={pageWrapper}
                className={"page-wrapper"}
                >
                    {children}
                </div>
            </div>
        </TransitionContext.Provider>
    )
}