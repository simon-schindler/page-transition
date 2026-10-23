export interface TransitionEndData{
    elArray: (HTMLDivElement|null)[]
    transitionProperty: 'opacity'|'clip-path'
    secondElArray: (HTMLDivElement|null)[]
}

export interface TransitionEndObj{
    elArray: (HTMLDivElement|null)[]
    transitionProperty: 'opacity'|'clip-path'
    secondElArray: (HTMLDivElement|null)[]
    fn: (()=>void)|null
}

export interface TransitionEndHandler {
    handler: ((e: TransitionEvent) => void) | null
    handlerEl: HTMLDivElement | null
}