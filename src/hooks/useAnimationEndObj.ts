import { useRef, useEffect } from "react";

import type { RefObject } from "react";

import type { AnimationEndData, AnimationEndObj } from "../types/animationEnd.types"

interface Props{
    animationEndData: RefObject<AnimationEndData>,
    fn: ()=>void
}  

export function useAnimationEndObj({animationEndData, fn}:Props){
    
    const animationEndObj=useRef<AnimationEndObj>({
        elArray: [],
        fn: null
    })

    useEffect(()=>{
        animationEndObj.current={
            ...animationEndData.current,
            fn
        }
    },[])

    return animationEndObj
}