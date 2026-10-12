import type { RefObject } from "react"

interface Obj{
    timeOutId: number|null
    fn: ()=>void
    ms?:number

}
interface Props{
    ref: RefObject<Obj>
}
export function debounce({ref}:Props){
    if(ref.current.timeOutId !== null){
        window.clearTimeout(ref.current.timeOutId)
    }
    ref.current.timeOutId=window.setTimeout(()=>{
        ref.current.fn()
    },ref.current.ms ?? 200)

}