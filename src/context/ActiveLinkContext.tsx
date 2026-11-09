"use client"
import { createContext, useContext, useEffect, useRef } from "react";

import type { ReactNode } from "react";
interface Props{
    saveRef: (href:string) =>(el:HTMLElement|null)=>void
}
const ActiveLinkContext = createContext<Props|null>(null)

export function useActiveLinkContext(){
    const context = useContext(ActiveLinkContext)
    if(!context)throw new Error('useNextPathname in Provider!')
    return context
}

let pathname = ""
export function dispatchNextPathname(href:string){
    pathname = href
    window.dispatchEvent(new CustomEvent('nextPathname',{detail: href}))
}

export function ActiveLinkProvider({children}:{children: ReactNode}){
    
    const map = useRef(new Map<HTMLElement, string>())
    
    function saveRef ( href: string ){
        let element: HTMLElement
        return (ref:HTMLElement|null)=>{
            if(ref){
                element = ref
                map.current.set(ref, href)
            }
            if(!ref)map.current.delete(element)
        }
    }

    useEffect(()=>{
        const handleActiveLink=(e: CustomEvent)=>{
            for(const [el, href] of map.current){
                el.classList.toggle('active', href === e.detail)
            }
        }

        for(const [el, href] of map.current){
            el.classList.toggle('active', href === pathname)
        }

        window.addEventListener('nextPathname', handleActiveLink)
        return()=>{
            window.removeEventListener('nextPathname', handleActiveLink)
            map.current.clear()
        }
    },[])

    return(
        <ActiveLinkContext.Provider value={{saveRef}}>
            {children}
        </ActiveLinkContext.Provider>
    )
}