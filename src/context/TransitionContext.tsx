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

interface TransitionOptions{
    transitionProperty: TransitionProperty
    items?: [number, number]
}
interface BaseProps{
    scroll?: 'auto'|'top'
    children: ReactNode
}

type ModeProps =
    |{
        mode?:'css'
        outside?: ReactNode
        options: TransitionOptions
    }
    |{
        mode: 'manual'
        outside?: never
        options?: never
    }

type ProviderProps = BaseProps & ModeProps

export function TransitionProvider(props: ProviderProps){
    const { scroll = 'auto' } = props
    
    return(
        props.mode === 'manual'?
        <ManualTransitionProvider
        scroll={scroll}
        children={props.children}
        /> :
        <CssTransitionProvider
        outside={props.outside}
        scroll={scroll}
        options={props.options}
        children={props.children}
        />
    )
}