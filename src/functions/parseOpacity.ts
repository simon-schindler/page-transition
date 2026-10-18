export function parseOpacity(el: HTMLDivElement|null): number|null{
    if(!el)return null
    
    const opacity  = getComputedStyle(el).opacity
    
    return parseFloat(opacity)
}