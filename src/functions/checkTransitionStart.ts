import { transitionRunning } from "./transitionRunning";

import type { TransitionEndData } from "../types/transitionEnd.types";

export function checkTransitionStart(transitionEndData: TransitionEndData, fn:(()=>void)|null){
    
    if(transitionRunning(transitionEndData.elArray, transitionEndData.transitionProperty, transitionEndData.group)){
        fn?.()
        return true
    }else{
        return false
    }
    
}