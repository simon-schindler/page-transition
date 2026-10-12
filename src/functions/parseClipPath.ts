export function parseClipPath(el: HTMLDivElement|null):number|null{
    if(!el)return null

    const clipPath = getComputedStyle(el).clipPath
    const match = clipPath.match(/inset\(([^)]+)\)/)
    const result = match?.[1]?.split(/\s+/)??null
    const number = result?.map(value=>parseFloat(value)).find(value => value > 0) ?? 0
    
    return number / 100
}