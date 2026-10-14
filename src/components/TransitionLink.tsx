import Link from "next/link"

import { useTransitionContext } from "../context/TransitionContext"

import type { ReactNode } from "react"

interface Props{
    href: string
    className?: string
    prefetch?: boolean 
    onClick?: ()=>void
    children: ReactNode
}

export function TransitionLink({
    href, 
    className, 
    prefetch,
    onClick,
    children
}: Props){
    
    const {handleLinkClick} = useTransitionContext()

    return(
        <Link 
        href={href} 
        onClick={(e)=>{
            handleLinkClick.current(e, href)
            onClick?.()
        }}
        className={className}
        prefetch={prefetch}
        >
            {children}
        </Link>
    )
}