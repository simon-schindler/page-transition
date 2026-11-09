
import { transitionRunning } from "./transitionRunning";
import type { RefObject } from "react";

import type { TransitionEndData } from "../types/transitionEnd.types";

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
    if(id.current !== null)cancelAnimationFrame(id.current)
    id.current = requestAnimationFrame(()=>{
        if(transitionRunning(
            transitionEndData.current.elArray,
            transitionEndData.current.transitionProperty,
            transitionEndData.current.group
        )){
            fn()
            return
        }
        pollTransitionStart({id,fn,transitionEndData})
    })
}