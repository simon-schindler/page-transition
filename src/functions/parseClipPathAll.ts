export function parseClipPathAll(elArray: (HTMLDivElement|null)[]):null| boolean{
    if(elArray.length === 0)return null
    
    const array:number[] = []
    
    elArray.forEach((el)=>{
        if(!el)return
        const clipPath = getComputedStyle(el).clipPath
        const m = clipPath.match(/inset\(([^)]+)\)/)
        const result = m?.[1]?.split(/\s+/)??null
        
        const number = result?.map((string)=>parseFloat(string)).find(n=>n>0)??0
        array.push(number)
    })
    
    for(const number of array){
        if(number < 100){
            return false
        } 
    }

    return true
}
