import { useRef, useEffect } from "react";

import type { RefObject } from "react";

import type { TransitionEndData, TransitionEndObj } from "../types/transitionEnd.types"

interface Props{
    transitionEndData: RefObject<TransitionEndData>,
    fn: ()=>void
}  

export function useTransitionEndObj({transitionEndData, fn}:Props){
    
    const transitionEndObj=useRef<TransitionEndObj>({
        elArray: [],
        transitionProperty: transitionEndData.current.transitionProperty,
        secondElArray:[],
        fn: null
    })

    useEffect(()=>{
        transitionEndObj.current={
            ...transitionEndData.current,
            fn
        }
    },[])

    return transitionEndObj
}