import Link from "next/link"

import { useCssContext } from "../../context/CssContext"

import type { ReactNode } from "react"

interface Props{
    href: string
    className?: string
    prefetch?: boolean 
    onClick?: (e:React.MouseEvent)=>void
    children: ReactNode
}

export function TransitionLink({
    href, 
    className, 
    prefetch,
    onClick,
    children
}: Props){
    
    const { handleLinkClick } = useCssContext()

    return(
        <Link 
        href={href} 
        onClick={(e)=>{
            onClick?.(e)
            handleLinkClick.current(e, href)
        }}
        className={className}
        prefetch={prefetch}
        >
            {children}
        </Link>
    )
}