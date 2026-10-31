"use client"

import { createContext, useContext } from "react";
import type { RefObject } from "react";

interface ContextProps{
    handleLinkClick: RefObject<((e: React.MouseEvent, url:string)=>void)>
    pageWrapper?: RefObject<HTMLDivElement|null>
    overlay?: RefObject<HTMLDivElement|null>
    overlayWrapper?: RefObject<HTMLDivElement|null>
    overlayItems?: RefObject<(HTMLDivElement|null)[]>
    secondItems?: RefObject<(HTMLDivElement|null)[]>
}

export const CssContext = createContext<ContextProps|null>(null)

export function useTransitionContext(){
    const context = useContext(CssContext);
    if(!context)throw new Error('useCssContext in Provider!')
    return context
}