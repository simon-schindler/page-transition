import { parseOpacityAll } from "./parseOpacityAll";
import { parseClipPathAll } from "./parseClipPathAll";

interface TransitionEndData{
    elArray: (HTMLDivElement|null)[]
    propertyName: 'opacity'|'clip-path'
}

export function checkTransitionStart(transitionEndData: TransitionEndData, fn:(()=>void)|null){
    
    const parse={
        'opacity': ()=>parseOpacityAll(transitionEndData.elArray),
        'clip-path': ()=>parseClipPathAll(transitionEndData.elArray)
    }
    
    if(parse[transitionEndData.propertyName]()){
        
        return false
    }else{
        fn?.()
        return true
    }
    
}