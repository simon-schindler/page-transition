import type { TransitionProperty } from "../types/transitionPropertys.types"

export function transitionRunning(elArray: (HTMLDivElement|null)[], transitionProperty:TransitionProperty, group:'overlay'|null):null|boolean{
    let el;
    
    if(group === 'overlay'){
        el = elArray[elArray.length-1]
    }else{
        if(!elArray[0])return null
        el = elArray[0]
    }

    const property = {
        opacity: 'opacity',
        'clip-path': 'clipPath',
        'transform': 'transform'
    }
    if(!el)return null
    if(el.getAnimations().some((obj)=>{   

        const progress = obj.effect?.getComputedTiming().progress

        return obj.playState === 'running' &&
        obj.effect instanceof KeyframeEffect &&
        obj.effect.getKeyframes().some(frame =>{
            return frame[property[transitionProperty]] !== undefined
        }) && progress != null && progress !== 0
    })){
        return true
    }
    
    return false
}