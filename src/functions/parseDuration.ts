export function parseDuration(el: HTMLElement|null): number{
    if(!el)return 0
    
    return parseFloat(getComputedStyle(el).transitionDuration)
}