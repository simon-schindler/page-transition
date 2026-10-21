import type { RefObject } from "react"

import { transtionEndReverse } from "./transitionEndReverse"

interface TransitionEndObj{
    elArray: (HTMLDivElement|null)[]
    transitionProperty: 'opacity' | 'clip-path'
    mirror: boolean
    mirrorElArray: (HTMLDivElement|null)[]
    delayStep: number
    duration: number
    fn: (()=>void)|null 
}
interface TransitionEndHandler {
    handler: ((e: TransitionEvent) => void) | null
    handlerEl: HTMLDivElement | null
}
interface Props{
    transitionEndObj:RefObject<TransitionEndObj>
    transitionEndHandler: RefObject<TransitionEndHandler>
    reverse: RefObject<{_lock: boolean,lock: boolean}>
}

export function transitionEnd({
    transitionEndObj,
    transitionEndHandler,
    reverse,
}: Props){
    
    const lastIndex = transitionEndObj.current.elArray.length - 1
    
    if(transitionEndHandler.current.handler && 
        transitionEndHandler.current.handlerEl){
        transitionEndHandler.current.handlerEl.removeEventListener('transitionend', transitionEndHandler.current.handler)
    }

    const endObj = transitionEndObj.current
    
    if(!reverse.current.lock){
        transtionEndReverse({
            transitionEndObj,
            transitionEndHandler,
            reverse
        })
        
        return
    }
    
    const handler = (e:TransitionEvent)=>{
        
        if(e.target !== e.currentTarget)return
        
        if(endObj.transitionProperty && 
            e.propertyName !== endObj.transitionProperty
        )return
        
        endObj.elArray[lastIndex]?.removeEventListener('transitionend', handler)
        endObj.fn?.()
    }

    transitionEndHandler.current.handler = handler
    
    transitionEndHandler.current.handlerEl = endObj.elArray[lastIndex]
    endObj.elArray[lastIndex]?.addEventListener('transitionend', transitionEndHandler.current.handler)
}