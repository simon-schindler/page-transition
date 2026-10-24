import type { TransitionProperty } from "./transitionPropertys.types"

export interface TransitionEndData{
    elArray: (HTMLDivElement|null)[]
    transitionProperty: TransitionProperty
    secondElArray: (HTMLDivElement|null)[]
}

export interface TransitionEndObj{
    elArray: (HTMLDivElement|null)[]
    transitionProperty: TransitionProperty
    secondElArray: (HTMLDivElement|null)[]
    fn: (()=>void)|null
}

export interface TransitionEndHandler {
    handler: ((e: TransitionEvent) => void) | null
    handlerEl: HTMLDivElement | null
}