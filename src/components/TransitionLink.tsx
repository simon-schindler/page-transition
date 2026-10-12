import Link from "next/link"

import { useTransitionContext } from "../context/TransitionContext"

import type { ReactNode } from "react"

export function TransitionLink({href, children}:{href: string, children: ReactNode}){
    
    const {handleLinkClick} = useTransitionContext()

    return(
        <Link 
        href={href} 
        onClick={(e)=>{
            handleLinkClick.current(e, href)
        }}>
            {children}
        </Link>
    )
}