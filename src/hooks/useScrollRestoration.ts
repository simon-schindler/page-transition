"use client"

import { useEffect, useRef } from "react";

import { debounce } from "../functions/debounce";

interface Props{
    scroll: 'auto'|'top'
}
export function useScrollRestoration({scroll}:Props){
    
    const saveScrollY=()=>{
        window.history.replaceState({
            ...window.history.state,
            scrollY: window.scrollY
        },
        "")
    }

    const debounceRef=useRef({
        timeOutId: null, 
        fn: saveScrollY
    })
    
    useEffect(()=>{
        window.history.scrollRestoration = 'manual'
        
        if(scroll === 'top'){
            return()=>window.history.scrollRestoration = 'auto'
        }
        
        const handleScroll=()=>{
            debounce({ref: debounceRef})
        }
        window.addEventListener('scroll', handleScroll)
        
        return()=>{
            window.history.scrollRestoration = 'auto'
            window.removeEventListener('scroll', handleScroll)
        }
    },[])
}