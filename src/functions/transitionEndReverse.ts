import type { RefObject } from "react"

import { parseClipPath } from "./parseClipPath"
import { parseOpacity } from "./parseOpacity"
import { resetDelay } from "./resetDelay"
interface TransitionEndObj{
    elArray: (HTMLDivElement|null)[]
    propertyName: 'opacity' | 'clip-path'
    fn: (()=>void)|null 
}
interface TransitionEndHandler {
    handler: ((e: TransitionEvent) => void) | null
    handlerEl: HTMLDivElement | null
}

interface Props{
    transitionEndObj:RefObject<TransitionEndObj>
    transitionEndHandler: RefObject<TransitionEndHandler>
    reverse: RefObject<{_lock: boolean, lock: boolean}>
    delay: RefObject<number|null>
}

export function transtionEndReverse({
    transitionEndObj,
    transitionEndHandler,
    reverse,
    delay
}:Props){
    
    if(transitionEndHandler.current.handler && 
        transitionEndHandler.current.handlerEl
    )transitionEndHandler.current.handlerEl.removeEventListener('transitionend', transitionEndHandler.current.handler)
    
    const obj = transitionEndObj.current
    
    const property = transitionEndObj.current.propertyName
    
    const parseFn={
        opacity: parseOpacity,
        'clip-path': parseClipPath
    }

    let summ = 0

    obj.elArray.toReversed().forEach((el)=>{
        if(!el)return
        
        const progress = parseFn[property](el)
       
        const d  = (delay.current??0) * (progress??0)
        el.style.transitionDelay = `${summ}s`
        summ += d
    }) 

    const firstEl = obj.elArray[0]

    const handler=(e: TransitionEvent)=>{
        
        if(e.propertyName !== obj.propertyName ||
            e.target !== e.currentTarget
        )return
        
        resetDelay(obj.elArray)
        reverse.current.lock = true
        firstEl?.removeEventListener('transitionend', handler)
        obj.fn?.()
    }

    transitionEndHandler.current.handler = handler
    transitionEndHandler.current.handlerEl = firstEl
    
    firstEl?.addEventListener('transitionend', handler)
}