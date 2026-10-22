export interface TransitionEndData{
    elArray: (HTMLDivElement|null)[]
    transitionProperty: 'opacity'|'clip-path'
    mirror: boolean
    mirrorElArray: (HTMLDivElement|null)[]
}

export interface TransitionEndObj{
    elArray: (HTMLDivElement|null)[]
    transitionProperty: 'opacity'|'clip-path'
    mirror: boolean
    mirrorElArray: (HTMLDivElement|null)[]
    fn: (()=>void)|null
}

export interface TransitionEndHandler {
    handler: ((e: TransitionEvent) => void) | null
    handlerEl: HTMLDivElement | null
}