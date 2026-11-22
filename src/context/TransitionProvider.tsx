"use client"

import { CssTransitionProvider } from "./CssTransitionProvider";
import { ManualTransitionProvider } from "./ManualTransitionProvider";

import type { ReactNode } from "react";
import type { TransitionProperty } from "../types/transitionPropertys.types";

import { ActiveLinkProvider } from "./ActiveLinkContext";
import { ExitFinishProvider } from "./ExitFinishContext";

interface TransitionOptions{
    transitionProperty: TransitionProperty
    overlays?: number
    items?: [number, number]
}
interface BaseProps{
    scroll?: 'auto'|'top'
    children: ReactNode
}

type ModeProps =
    |{
        mode?:'css'
        outside?: ReactNode
        options: TransitionOptions
    }
    |{
        mode: 'manual'
        outside?: ReactNode
        options?: never
    }

type ProviderProps = BaseProps & ModeProps

export function TransitionProvider(props: ProviderProps){
    const { scroll = 'auto', children } = props
    
    return(
        <ActiveLinkProvider>
            <ExitFinishProvider>
                {
                    props.mode === 'manual' ?
                    <ManualTransitionProvider
                    scroll={scroll}
                    outside={props.outside}
                    children={children}
                    />
                    :
                    <CssTransitionProvider
                    scroll={scroll}
                    outside={props.outside}
                    options={props.options}
                    children={children}
                    />
                    
                }
            </ExitFinishProvider>
        </ActiveLinkProvider>
    )

}