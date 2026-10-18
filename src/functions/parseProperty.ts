import { parseOpacity } from "./parseOpacity";
import { parseClipPath } from "./parseClipPath";

export function parseProperty(transitionProperty:'opacity'|'clip-path', el:HTMLDivElement|null){
    
    if(!el)return null
    
    const parse = {
        'opacity': parseOpacity,
        'clip-path': parseClipPath
    }
    
    return parse[transitionProperty](el)
}