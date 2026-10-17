export function parseFirstClipPath(elArray: (HTMLDivElement|null)[]):null|boolean{
    if(!elArray[0])return null
    
    const clipPath = getComputedStyle(elArray[0]).clipPath
    const m = clipPath.match(/inset\(([^)]+)\)/) ?? null
    const arr = m?.[1].split(/\s+/)??[]
    
    for(const string of arr){
        if(parseFloat(string) < 100) return true
    }
    return false
}