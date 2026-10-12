export function parseOpacityAll(elArray: (HTMLDivElement|null)[]): boolean | null{
    if(elArray.length === 0)return null
    
    for(const el of elArray){
        if(!el)continue
        const opacity  = parseFloat(getComputedStyle(el).opacity)
        
        if(opacity > 0){
            return false
        }
    }
   
    return true
}
