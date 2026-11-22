import { createContext, useContext, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
interface Props{
    setExitFinish: Dispatch<SetStateAction<boolean>>
    exitFinish: boolean
}
const ExitFinishContext = createContext<Props|null>(null)

export function useExitFinishContext(){
    const context = useContext(ExitFinishContext)
    if(!context)throw new Error('useExitFinishContext in Provider!')
    return context
}

export function ExitFinishProvider({children}:{children:ReactNode}){
    const [exitFinish, setExitFinish]=useState<boolean>(true)
    return(
        <ExitFinishContext.Provider value={{setExitFinish,exitFinish}}>
            {children}
        </ExitFinishContext.Provider>
    )
}