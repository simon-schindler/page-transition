export {}

declare global{
    interface WindowEventMap{
        "nextPathname": CustomEvent<string>
    }
}