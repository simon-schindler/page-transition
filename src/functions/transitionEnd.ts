import type { RefObject } from "react"

import type { TransitionEndObj, TransitionEndHandler } from "../types/transitionEnd.types"

interface Props{
    transitionEndObj:RefObject<TransitionEndObj>
    transitionEndHandler: RefObject<TransitionEndHandler>
}

export function transitionEnd({
    transitionEndObj,
    transitionEndHandler
}: Props){
    
    const lastIndex = transitionEndObj.current.elArray.length - 1
    
    if(transitionEndHandler.current.handler && 
        transitionEndHandler.current.handlerEl){
        transitionEndHandler.current.handlerEl.removeEventListener('transitionend', transitionEndHandler.current.handler)
    }

    const endObj = transitionEndObj.current
    
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