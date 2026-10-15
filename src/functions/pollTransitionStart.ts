import { checkTransitionStart } from "./checkTransitionStart";
import type { RefObject } from "react";

interface TransitionEndData{
    elArray: (HTMLDivElement|null)[]
    propertyName: 'opacity'|'clip-path'
}

interface Props{
    id: RefObject<number|null>
    fn: ()=>void
    transitionEndData: RefObject<TransitionEndData>
}
export function pollTransitionStart({
    id, 
    fn,
    transitionEndData
}:Props){
    id.current = requestAnimationFrame(()=>{
        if(checkTransitionStart(transitionEndData.current, fn)){
            return
        }
        pollTransitionStart({id,fn,transitionEndData})
    })
}