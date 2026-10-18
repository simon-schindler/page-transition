import { parseProperty } from "./parseProperty"

interface Props{
    elArray: (HTMLDivElement|null)[]
    transitionProperty: 'opacity'|'clip-path'
    delayStep: number|null
}

export function setDelayReverse({elArray, transitionProperty, delayStep}: Props){
    if(elArray.length < 2 || !delayStep)return
    let summ = 0
    elArray.toReversed().forEach((el, i)=>{
        if(!el)return
        el.style.transitionDelay = `${summ}s`
        const progress = parseProperty(transitionProperty,el)??0
        summ += (delayStep*progress)
    })
}