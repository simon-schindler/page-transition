export function parseFirstOpacity(elArray:(HTMLDivElement|null) []):null|boolean{
    if(!elArray[0])return null
    
    const opacity = parseFloat(getComputedStyle(elArray[0]).opacity)
    if(opacity > 0)return true 
    return false
}