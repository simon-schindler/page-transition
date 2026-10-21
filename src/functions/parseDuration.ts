export function parseDuration(el: HTMLElement|null): number|null{
    if(!el)return null
    const duration = parseFloat(getComputedStyle(el).transitionDuration)
    return duration ?  duration : 250
}