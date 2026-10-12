export function resetDelay(elArray: (HTMLDivElement|null)[]){
    elArray.forEach((el)=>{
        if(!el)return
        el.style.transitionDelay=""
    })
}