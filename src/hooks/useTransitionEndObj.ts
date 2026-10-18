import { useRef, useEffect } from "react";

import type { RefObject } from "react";

interface TransitionEndData{
    elArray: (HTMLDivElement|null)[]
    propertyName: 'opacity'|'clip-path'
    mirror: boolean
    mirrorElArray: (HTMLDivElement|null)[]
}
interface Props{
    transitionEndData: RefObject<TransitionEndData>
    fn: ()=>void
}  
interface TransitionEndObj{
    elArray: (HTMLDivElement|null)[]
    propertyName: 'opacity'|'clip-path'
    mirror: boolean
    mirrorElArray: (HTMLDivElement|null)[]
    fn: (()=>void)|null
    
}

export function useTransitionEndObj({transitionEndData, fn}:Props){
    
    const transitionEndObj=useRef<TransitionEndObj>({
        elArray: [],
        propertyName: transitionEndData.current.propertyName,
        mirror:transitionEndData.current.mirror,
        mirrorElArray:[],
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