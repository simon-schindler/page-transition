export function parseDelay(elArray: (HTMLDivElement|null)[]):number|null{
    if(elArray.length === 0)return null

    const lastIndex = elArray.length - 1
    const lastEl = elArray[lastIndex] 
    
    if(!lastEl)return null

    const lastDelay = parseFloat(getComputedStyle(lastEl).transitionDelay) 
    
    return lastDelay / lastIndex
}