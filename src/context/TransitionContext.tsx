"use client"

import { createContext, useContext } from "react";

import type { ReactNode, RefObject} from "react";

import { CssTransitionProvider } from "./CssTransitionProvider";
import { ManualTransitionProvider } from "./ManualTransitionProvider";

import type { TransitionProperty } from "../types/transitionPropertys.types";

interface ContextProps{
    handleLinkClick: RefObject<((e: React.MouseEvent, url:string)=>void)>
    resolveFn?: RefObject<(()=>void)|null>
    state?: RefObject<'idle'|'exiting'|'entering'>
    pageWrapper?: RefObject<HTMLDivElement|null>
    overlayWrapper?: RefObject<HTMLDivElement|null>
    overlayItems?: RefObject<(HTMLDivElement|null)[]>
    secondItems?: RefObject<(HTMLDivElement|null)[]>
}

export const TransitionContext = createContext<ContextProps|null>(null)

export function useTransitionContext(){
    const context = useContext(TransitionContext)
    if(!context)throw new Error('useTransitionContext in Provider!')
    return context
}

type Mode = 'css'|'manual'

interface TransitionOptions{
    transitionProperty: TransitionProperty
    items?: [number, number]
}
interface ProviderProps{
    outside?: ReactNode
    mode?: Mode
    options: TransitionOptions
    children: ReactNode
}

export function TransitionProvider({
    outside,
    mode='css',
    options, 
    children
}:ProviderProps){
    
    return(
        mode === 'css'?
        <CssTransitionProvider
        outside={outside}
        options={options}
        children={children}
        />:
        <ManualTransitionProvider
        children={children}
        />
    )
}