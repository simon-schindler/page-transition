"use client"

import { CssTransitionProvider } from "./CssTransitionProvider";
import { ManualTransitionProvider } from "./ManualTransitionProvider";

import type { ReactNode } from "react";
import type { TransitionProperty } from "../types/transitionPropertys.types";

interface TransitionOptions{
    transitionProperty: TransitionProperty
    overlay?: boolean
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
        outside?: never
        options?: never
    }

type ProviderProps = BaseProps & ModeProps

export function TransitionProvider(props: ProviderProps){
    const { scroll = 'auto', children } = props
    return(
        props.mode === 'manual' ?
        <ManualTransitionProvider
        scroll={scroll}
        children={children}
        />:
        <CssTransitionProvider
        scroll={scroll}
        outside={props.outside}
        options={props.options}
        children={children}
        />
    )

}