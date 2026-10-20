interface Props{
    elArray: (HTMLDivElement|null)[]
    transitionProperty: 'opacity'|'clip-path'
    value: number
}
export function setPlaybackRate({elArray, transitionProperty, value}:Props){
    elArray.forEach((el)=>{
        el?.getAnimations().forEach((obj)=>{
            if(obj instanceof CSSTransition && 
                obj.transitionProperty === transitionProperty
            ){
                obj.updatePlaybackRate(value)
            }
        })
    })
}