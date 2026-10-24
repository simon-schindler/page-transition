import type { TransitionProperty } from "../types/transitionPropertys.types"

export function transitionRunning(elArray: (HTMLDivElement|null)[], transitionProperty:TransitionProperty):null|boolean{
    if(!elArray[0])return null
    
    const property = {
        opacity: 'opacity',
        'clip-path': 'clipPath',
        'transform': 'transform'
    }
    
    if(elArray[0].getAnimations().some((obj)=>{   
        return obj.playState === 'running' &&
        obj.effect instanceof KeyframeEffect &&
        obj.effect.getKeyframes().some(frame =>{
            return frame[property[transitionProperty]] !== undefined
        })
    })){
        return true
    }
    
    return false
}