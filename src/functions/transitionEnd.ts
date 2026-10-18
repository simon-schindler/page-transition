import type { RefObject } from "react"

import { transtionEndReverse } from "./transitionEndReverse"

interface TransitionEndObj{
    elArray: (HTMLDivElement|null)[]
    propertyName: 'opacity' | 'clip-path'
    mirror: boolean
    mirrorElArray: (HTMLDivElement|null)[]
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
    delayStep: RefObject<number|null>
}

export function transitionEnd({
    transitionEndObj,
    transitionEndHandler,
    reverse,
    delayStep
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
            reverse,
            delayStep
        })
        
        return
    }
    
    const handler = (e:TransitionEvent)=>{
        
        if(e.target !== e.currentTarget)return
        
        if(endObj.propertyName && 
            e.propertyName !== endObj.propertyName
        )return
        
        endObj.elArray[lastIndex]?.removeEventListener('transitionend', handler)
        endObj.fn?.()
    }

    transitionEndHandler.current.handler = handler
    
    transitionEndHandler.current.handlerEl = endObj.elArray[lastIndex]
    endObj.elArray[lastIndex]?.addEventListener('transitionend', transitionEndHandler.current.handler)
}