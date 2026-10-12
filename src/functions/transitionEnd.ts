import type { RefObject } from "react"

import { transtionEndReverse } from "./transitionEndReverse"

interface TransitionEndObj{
    elArray: (HTMLDivElement|null)[]
    propertyName: 'opacity'|'clip-path'
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
    delay: RefObject<number|null>
}

export function transitionEnd({
    transitionEndObj,
    transitionEndHandler,
    reverse,
    delay
}: Props){
    
    const lastIndex = transitionEndObj.current.elArray.length - 1
    
    if(transitionEndHandler.current.handler && 
        transitionEndHandler.current.handlerEl){
        transitionEndHandler.current.handlerEl.removeEventListener('transitionend', transitionEndHandler.current.handler)
    }
    
    if(!reverse.current.lock){
        transtionEndReverse({
            transitionEndObj,
            transitionEndHandler,
            reverse,
            delay
        })
        
        return
    }
    
    const handler = (e:TransitionEvent)=>{
        
        if(e.target !== e.currentTarget)return
        
        if(transitionEndObj.current.propertyName && 
            e.propertyName !== transitionEndObj.current.propertyName
        )return
        
        transitionEndObj.current.elArray[lastIndex]?.removeEventListener('transitionend', handler)
        transitionEndObj.current.fn?.()
    }

    transitionEndHandler.current.handler = handler
    
    transitionEndHandler.current.handlerEl = transitionEndObj.current.elArray[lastIndex]
    transitionEndObj.current.elArray[lastIndex]?.addEventListener('transitionend', transitionEndHandler.current.handler)
}