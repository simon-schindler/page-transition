import type { RefObject } from "react"

import type { AnimationEndObj, AnimationEndHandler } from "../types/animationEnd.types"

interface Props{
    animationEndObj:RefObject<AnimationEndObj>
    animationEndHandler: RefObject<AnimationEndHandler>
}

export function animationEnd({
    animationEndObj,
    animationEndHandler
}: Props){
    const endObj = animationEndObj.current
    const lastIndex = animationEndObj.current.elArray.length - 1
    
    if(animationEndHandler.current.handler && 
        animationEndHandler.current.handlerEl){
        animationEndHandler.current.handlerEl.removeEventListener('animationend', animationEndHandler.current.handler)
    }

    if(!endObj.elArray[lastIndex])return
    

    const handler = (e: AnimationEvent)=>{
        
        if(e.target !== e.currentTarget)return
        
        endObj.elArray[lastIndex]?.removeEventListener('animationend', handler)
        endObj.fn?.()
    }

    animationEndHandler.current.handler = handler
    animationEndHandler.current.handlerEl = endObj.elArray[lastIndex]
    
    endObj.elArray[lastIndex]?.addEventListener('animationend', animationEndHandler.current.handler)
}