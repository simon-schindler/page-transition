"use client"

import { CssContext } from "./CssContext";

import { useRef, useMemo, useEffect, useState} from "react";
import { usePathname } from "next/navigation";

import type { ReactNode } from "react";

import { useAnimationEndHandler } from "../hooks/useAnimationEndHandler";
import { useAnimationEndData } from "../hooks/useAnimationEndData";

import { useHandleLinkClick } from "../hooks/useHandleLinkClick";
import { useScrollRestoration } from "../hooks/useScrollRestoration";
import { usePopState } from "../hooks/usePopState";

import { dispatchNextPathname } from "./ActiveLinkContext"

import { CurrentPage } from "../components/CurrentPage";

interface TransitionOptions{
    overlays?: number
    items?: [number, number]
}
interface DefaultOptions{
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
    
    const state = useRef<'idle'|'exiting'|'entering'>('idle')
    const basePath = useRef<string|null>(null)
    
    const [newSnapshot, setNewSnapshot]=useState(0)
    const [visible, setVisible]=useState(false)
    const currentPage = useRef<HTMLDivElement|null>(null)

    const handleLinkClick = useRef<((e: React.MouseEvent, url:string)=>void)>(()=>{})

    const animationEndHandler = useAnimationEndHandler()
    
    const elArray = defaultOptions.items[0] > 0 ? firstItems : 
        defaultOptions.overlays > 0 ? overlays : currentPage
        
    group.current = defaultOptions.overlays > 0 && defaultOptions.items[0] === 0 ?
    'overlay':null

    const animationEndData = useAnimationEndData({
        elArray,
        group: group
    })

    usePopState({
        container,
        basePath,
        animationEndData,
        animationEndHandler,
        state,
        setVisible,
        setNewSnapshot
    })
    useHandleLinkClick({
        container,
        handleLinkClick,
        basePath,
        animationEndData,
        animationEndHandler,
        state,
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
        pageWrapper:currentPage,
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
                {children} 
                <CurrentPage 
                newSnapshot={newSnapshot}
                visiblity={visible}
                currentPage={currentPage}
                children={children}
                />
            </div>
        </CssContext.Provider>
    )
}