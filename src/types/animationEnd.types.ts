export interface AnimationEndData{
    elArray: (HTMLDivElement|null)[]
    group: 'overlay'| null
}

export interface AnimationEndObj{
    elArray: (HTMLDivElement|null)[]
    fn: (()=>void)|null
}

export interface AnimationEndHandler {
    handler: ((e: AnimationEvent) => void) | null
    handlerEl: HTMLDivElement | null
}