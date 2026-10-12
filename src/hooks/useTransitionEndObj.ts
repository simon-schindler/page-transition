import { useRef, useEffect } from "react";

import type { RefObject } from "react";

interface TransitionEndData{
    elArray: (HTMLDivElement|null)[]
    propertyName: 'opacity'|'clip-path'
}
interface Props{
    transitionEndData: RefObject<TransitionEndData>
    fn: ()=>void
}  
interface TransitionEndObj{
    elArray: (HTMLDivElement|null)[]
    propertyName: 'opacity'|'clip-path'
    fn: (()=>void)|null
    
}

export function useTransitionEndObj({transitionEndData, fn}:Props){
    
    const transitionEndObj=useRef<TransitionEndObj>({
        elArray: [null],
        propertyName: transitionEndData.current.propertyName,
        fn: null,
        
    })

    useEffect(()=>{
        transitionEndObj.current={
            ...transitionEndData.current,
            fn
        }
    },[])

    return transitionEndObj
}