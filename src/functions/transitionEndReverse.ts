import type { RefObject } from "react"

import { setDelayReverse } from "./setDelayReverse"
import { resetDelay } from "./resetDelay"

interface TransitionEndObj{
    elArray: (HTMLDivElement|null)[]
    transitionProperty: 'opacity' | 'clip-path'
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
    reverse: RefObject<{_lock: boolean, lock: boolean}>
    delayStep: RefObject<number|null>
}

export function transtionEndReverse({
    transitionEndObj,
    transitionEndHandler,
    reverse,
    delayStep
}:Props){
    
    if(transitionEndHandler.current.handler && 
        transitionEndHandler.current.handlerEl
    )transitionEndHandler.current.handlerEl.removeEventListener('transitionend', transitionEndHandler.current.handler)
    
    const endObj = transitionEndObj.current
    
    setDelayReverse({
        elArray: endObj.elArray,
        transitionProperty: endObj.transitionProperty,
        delayStep: delayStep.current
    })
    if(endObj.mirror){
        setDelayReverse({
            elArray: endObj.mirrorElArray,
            transitionProperty: endObj.transitionProperty,
            delayStep: delayStep.current
        })
    }
    
    const firstEl = endObj.elArray[0]

    const handler=(e: TransitionEvent)=>{
        console.log('transitionEndReverse handler fired')
        if(e.propertyName !== endObj.transitionProperty ||
            e.target !== e.currentTarget
        )return
        
        resetDelay(endObj.elArray)
        resetDelay(endObj.mirrorElArray)
        reverse.current.lock = true
        firstEl?.removeEventListener('transitionend', handler)
        endObj.fn?.()
    }

    transitionEndHandler.current.handler = handler
    transitionEndHandler.current.handlerEl = firstEl
    
    firstEl?.addEventListener('transitionend', handler)
}