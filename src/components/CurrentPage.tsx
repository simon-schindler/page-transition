import { useRef, useLayoutEffect } from "react";


import type { ReactNode, RefObject } from "react";

interface Props{
    children: ReactNode
    newSnapshot: number
    visiblity: boolean
    currentPage: RefObject<HTMLDivElement|null>
}
export function CurrentPage({children, newSnapshot, visiblity, currentPage}:Props){
    
    const container = useRef<HTMLDivElement|null>(null);
    const snapshot = useRef<HTMLDivElement|null>(null)
    
    useLayoutEffect(()=>{
        if(!snapshot.current || !container.current)return
        
        snapshot.current?.replaceChildren(
            ...Array.from(container.current.childNodes).map(node => node.cloneNode(true))
        )
        currentPage.current = snapshot.current
        
    },[newSnapshot])
    
    return(
        <>
            <div 
            ref={container}
            style={{display:'none',position: 'absolute'}}>
                {children}
            </div>
            <div 
            className="page-wrapper"
            ref={snapshot}
            style={{position: 'absolute', inset:0, visibility: visiblity? 'visible':'hidden'}}
            />
        </>
    )
}