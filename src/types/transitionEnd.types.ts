import type { TransitionProperty } from "./transitionPropertys.types"

export interface TransitionEndData{
    elArray: (HTMLDivElement|null)[]
    transitionProperty: TransitionProperty
    group: 'overlay'| null
}

export interface TransitionEndObj{
    elArray: (HTMLDivElement|null)[]
    transitionProperty: TransitionProperty
    fn: (()=>void)|null
}

export interface TransitionEndHandler {
    handler: ((e: TransitionEvent) => void) | null
    handlerEl: HTMLDivElement | null
}