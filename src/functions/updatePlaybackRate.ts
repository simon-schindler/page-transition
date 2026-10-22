import type { RefObject } from "react";

interface Props{
    rafId: RefObject<number|null>
    rejectFn: RefObject<(()=>void)|null>
    elArray: (HTMLDivElement|null)[]
    transitionProperty: 'opacity'|'clip-path'
    target: number,
    duration: number
}

export function updatePlaybackRate({rafId, rejectFn, elArray, transitionProperty, target, duration}:Props):Promise<void>{
    
    if(rafId.current !== null)cancelAnimationFrame(rafId.current)
    
    if(duration === 0)return Promise.resolve()
    const d = (duration * 1000)/2
    
    let progress = 0
    let summ = target ? 0: d
    
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
            const dt = Math.min(now - before, 30)
            before = now

            summ = target? Math.min(summ + dt, d):Math.max(summ - dt, 0)
        
            progress = summ / d

            animationArray.forEach((obj:CSSTransition)=>{
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