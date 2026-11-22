"use client"

import { CssContext } from "./CssContext";

import { useRef, useMemo, useEffect, useState} from "react";
import { usePathname } from "next/navigation";

import type { ReactNode } from "react";

import { useTransitionEndHandler } from "../hooks/useTransitionEndHandler";
import { useTransitionEndData } from "../hooks/useTransitionEndData";


import { useHandleLinkClick } from "../hooks/useHandleLinkClick";
import { useScrollRestoration } from "../hooks/useScrollRestoration";
import { usePopState } from "../hooks/usePopState";

import { dispatchNextPathname } from "./ActiveLinkContext"

import type { TransitionProperty } from "../types/transitionPropertys.types";

import { PrevPage } from "../components/PrevPage";

interface TransitionOptions{
    transitionProperty: TransitionProperty
    overlays?: number
    items?: [number, number]
}
interface DefaultOptions{
    transitionProperty: TransitionProperty
    overlays: number
    items: [number, number]
}

interface ProviderProps{
    outside?: ReactNode
    scroll: 'auto'|'top'
    options: TransitionOptions
    children: ReactNode
}
export function CssTransitionProvider({ 
    outside,
    scroll,
    options, 
    children
}:ProviderProps){

    const defaultOptions:DefaultOptions = {
        overlays: 0,
        items: [0, 0],
        ...options
    }

    const container = useRef<HTMLDivElement|null>(null)
    const pageWrapper = useRef<HTMLDivElement|null>(null)
    
    const overlays = useRef<(HTMLDivElement|null)[]>([])
    const itemWrapper = useRef<HTMLDivElement|null>(null)
    const firstItems = useRef<(HTMLDivElement|null)[]>([])
    const secondItems = useRef<(HTMLDivElement|null)[]>([])

    const group=useRef<'overlay'|null>(null)
    
    const pathname = usePathname()
    
    const mount=useRef({
        mounted: false,
        initPathname: pathname
    })
    
    const state = useRef<'idle'|'exiting'|'navigating'|'entering'>('idle')
    const basePath = useRef<string|null>(null)
    
    const [newSnapshot, setNewSnapshot]=useState(0)
    const [visible, setVisible]=useState(false)
    const prevPage = useRef<HTMLDivElement|null>(null)

    const handleLinkClick = useRef<((e: React.MouseEvent, url:string)=>void)>(()=>{})

    const transitionEndHandler = useTransitionEndHandler()
    
    const elArray = defaultOptions.items[0] > 0 ? firstItems : 
        defaultOptions.overlays > 0 ? overlays : pageWrapper
        
    group.current = defaultOptions.overlays > 0 && defaultOptions.items[0] === 0 ?
    'overlay':null

    const transitionEndData = useTransitionEndData({
        elArray,
        transitionProperty: defaultOptions.transitionProperty,
        group: group
    })

    const pollRafId = useRef<number|null>(null)

    usePopState({
        container,
        basePath,
        transitionEndData,
        transitionEndHandler,
        state,
        pollRafId,
        setVisible,
        setNewSnapshot
    })
    useHandleLinkClick({
        container,
        handleLinkClick,
        basePath,
        transitionEndData,
        transitionEndHandler,
        state,
        pollRafId,
        setVisible,
        setNewSnapshot
        
    })
    useScrollRestoration({scroll})

    useEffect(()=>{
        if(mount.current.mounted === false && 
            mount.current.initPathname === pathname
        ){
            dispatchNextPathname(pathname)
            
            basePath.current = window.location.pathname.slice(0, -pathname.length)
            return
        }
        mount.current.mounted = true
        
    },[pathname])
      
    const value=useMemo(()=>({
        handleLinkClick, 
        pageWrapper,
        overlays, 
        itemWrapper, 
        firstItems, 
        secondItems
    }),[])

    return(
        <CssContext.Provider value={value}>
            <div 
            ref={container}
            data-transition
            >
                {
                    defaultOptions.overlays > 0 && 
                    Array.from({length: defaultOptions.overlays}).map((_,i)=>(
                        <div 
                        key={`overlay-${i}`}
                        ref={(el)=>{overlays.current[i]=el}}
                        className="overlay"
                        />
                    ))
                    
                }
                {
                    (defaultOptions.items[0] > 0 ||  defaultOptions.items[1] > 0) && 
                    <div 
                    ref={itemWrapper}
                    className="item-wrapper"
                    >
                        {
                            defaultOptions.items[0] > 0 && Array.from({length: defaultOptions.items[0]}).map((_,i)=>(
                                <div 
                                key={i}
                                ref={(el)=>{
                                    firstItems.current[i]=el
                                }}
                                className="first-item"/>
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
                {outside}
                <div 
                ref={pageWrapper}
                className={"page-wrapper"}
                >          
                {children} 
                </div>
                <PrevPage 
                newSnapshot={newSnapshot}
                visiblity={visible}
                prevPage={prevPage}
                children={children}
                />
            </div>
        </CssContext.Provider>
    )
}