"use client"

import { createContext, useContext } from "react";

import type { ReactNode, RefObject} from "react";

import { CssTransitionProvider } from "./CssTransitionProvider";
import { ManualTransitionProvider } from "./ManualTransitionProvider";

interface ContextProps{
    handleLinkClick: RefObject<((e: React.MouseEvent, url:string)=>void)>
    overlayWrapper?: RefObject<HTMLDivElement|null>
    overlayItems?: RefObject<(HTMLDivElement|null)[]>
    resolveFn?: RefObject<(()=>void)|null>
    state?: RefObject<'idle'|'exiting'|'entering'>
}

export const TransitionContext = createContext<ContextProps|null>(null)

export function useTransitionContext(){
    const context = useContext(TransitionContext)
    if(!context)throw new Error('useTransitionContext in Provider!')
    return context
}

type Mode = 'css'|'manual'
type TransitionProperty = 'opacity'|'clip-path'

interface TransitionOptions{
    transitionProperty?: TransitionProperty
    overlayCount?: number
    mirror?: boolean
}
interface ProviderProps{
    header?: ReactNode
    mode?: Mode
    options?: TransitionOptions
    children: ReactNode
}

export function TransitionProvider({
    header,
    mode='css',
    options, 
    children,
}:ProviderProps){
    
    return(
        mode === 'css'?
        <CssTransitionProvider
        header={header}
        options={options}
        children={children}
        />:
        <ManualTransitionProvider
        children={children}
        />
    )
}