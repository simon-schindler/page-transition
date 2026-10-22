import { parseFirstOpacity } from "./parseFirstOpacity";
import { parseFirstClipPath } from "./parseFirstClipPath";

import type { TransitionEndData } from "../types/transitionEnd.types";

export function checkTransitionStart(transitionEndData: TransitionEndData, fn:(()=>void)|null){
    
    const parse={
        'opacity': ()=>parseFirstOpacity(transitionEndData.elArray),
        'clip-path': ()=>parseFirstClipPath(transitionEndData.elArray)
    }
    
    if(parse[transitionEndData.transitionProperty]()){
        fn?.()
        return true
    }else{
        return false
    }
    
}