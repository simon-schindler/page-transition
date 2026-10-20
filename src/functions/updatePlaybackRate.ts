import type { Ref, RefObject } from "react";

interface Props{
    rafId: RefObject<number|null>
    rejectFn: RefObject<(()=>void)|null>
    elArray: (HTMLDivElement|null)[]
    transitionProperty: 'opacity'|'clip-path'
    target: number
}

export function updatePlaybackRate({rafId, rejectFn, elArray, transitionProperty, target}:Props):Promise<void>{
    
    if(rafId.current !== null)cancelAnimationFrame(rafId.current)
    
    let duration:number = 0
    if(elArray[0]){
        duration = (parseFloat(getComputedStyle(elArray[0]).transitionDuration)*1000)/ 2
    }
    let progress = 0
    let summ = target ? 0: duration 
    
    let animationArray:CSSTransition[] = []
    
    elArray.forEach((el)=>{
        el?.getAnimations().forEach((obj)=>{
            if(obj instanceof CSSTransition && 
                obj.transitionProperty === transitionProperty
            ){
                animationArray.push(obj)
            }
        })
    })
    
    let before: number|null = null
    return new Promise<void>((resolve, reject)=>{

        rejectFn.current?.()
        rejectFn.current = reject

        const step=(now:number)=>{
            if(before === null){
                before = now
            }
            const dt = now - before
            before = now

            summ = target? Math.min(summ + dt, duration):Math.max(summ - dt, 0)
        
            progress = summ / duration

            animationArray.forEach((obj:CSSTransition,i)=>{
                obj.updatePlaybackRate(progress)
            })
            
            if(target && progress >= 1 || !target && progress <=0 ){
                
                if(rafId.current !== null){
                    cancelAnimationFrame(rafId.current)
                    rafId.current = null
                }
                rejectFn.current = null
                resolve()

                return
            }
                
            
            rafId.current = requestAnimationFrame(step)
        }
        rafId.current = requestAnimationFrame(step)
    })
}