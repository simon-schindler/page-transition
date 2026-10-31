"use client"

import { createContext, useContext } from "react";
import type { RefObject } from "react";

interface ContextProps{
    handleLinkClick: RefObject<((e: React.MouseEvent, url:string)=>void)>
    resolveFn?: RefObject<(()=>void)|null>
    state?: RefObject<'idle'|'exiting'|'entering'>
}

export const ManualContext = createContext<ContextProps|null>(null)

export function useTransitionContext(){
    const context = useContext(ManualContext);
    if(!context)throw new Error('useManualContext in Provider!')
    return context
}