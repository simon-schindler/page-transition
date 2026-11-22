# page-transition
A page transition library for the Next.js App Router.
<br/>    
[![Live Demo ↗](https://img.shields.io/badge/Live_Demo_%E2%86%97-000000?style=for-the-badge)](https://simon-schindler.github.io/page-transition-demo/)
  
   
## Features

- CSS & Manual mode
- Scroll restoration

## Install  
![Version](https://img.shields.io/badge/v0.4.0-000000) ![82.9 KB](https://img.shields.io/badge/82.9_KB-1677FF)  
  
  `npm install page-transition`  
  
  ## Usage
Import your page transition styles and wrap your page content with `TransitionProvider` in your root layout.

```tsx
import { TransitionProvider } from "page-transition"
import './transition-styles.css'

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <TransitionProvider>
          {children}
        </TransitionProvider>
      </body>
    </html>
  );
}
```

## Components

### `TransitionProvider`
#### Props

|Prop|Type|Default|Mode|
|---|---|---|---|
| mode | "css" \| "manual" | "css" | Both |
| scroll | "auto" \| "top" | "auto" | Both |
| outside | JSX | - | Both |
| options | *Options* | {} | CSS |

*Options*

| Option | Type | Default | Required |
|---|---|---|---|
| overlays | number | 0 | - |
| items | [number, number] | [0, 0] | - |


**Prop Descriptions**

**mode**  
Select the transition mode.

**scroll**  
Controls browser scroll restoration during back and forward navigation.  
`'auto'` Restores the previous scroll position.  
`'top'` Scrolls to the top.

**outside**  
Components rendered outside .page-wrapper, but still inside the transition container.

**options.overlays**  
Number of overlay elements to add to the transition container.  
Each element receives the `.overlay` class.

**options.items**  
`options.items[0]`
Number of items in the first group. Each item receives the `.first-item` class.  
`options.items[1]`
Number of items in the second group. Each item receives the `.second-item` class.


```tsx
<TransitionProvider
outside={<Header/>}
options={{
    overlays: 1
}}
>
  {children}
</TransitionProvider>
```

### `TransitionLink`
#### Props

|Prop|Type|Default|Required
|---|---|---|---|
| href | string | - | Yes |
| className | string | - | - |
| prefetch | boolean \| "auto" \| null | null | - |
| onClick | (e: React.MouseEvent)=>void | - | - |

**Prop Descriptions**  
TransitionLink uses the Next.js Link component internally. For details about navigation behavior and supported props, refer to the official Next.js documentation.

**Description**  
Triggers the transition. 

*Must be used within the TransitionProvider*

css
```tsx
import {TransitionLink} from "page-transition/css"

```  
manual
```tsx
import {TransitionLink} from "page-transition/manual"
```

```tsx
<TransitionLink href={"/home"}>
  Home
</TransitionLink>
```

### CSS Mode

The `TransitionProvider` uses a container with a `data-transition` attribute. When navigation starts, it adds the `exit` class and waits for the animationend event.

By default, the event listener is attached to `.page-wrapper`, which contains the page's children and is a clone.

If `options.overlays` is greater than 0, the animation event is tracked on the last element of the overlay group.

If `options.items` specifies one or more items, the animation event is tracked on the last item of the first group.

The `.item-wrapper` is provided to group and position animation items. It is primarily intended for transitions that require multiple grouped elements. The number of items in each group can be configured using the options.items array.

Once the animation ends, the scroll position is restored and a new clone of .page-wrapper is created.

After navigation, the exit class is removed and the enter class is added. Once the next animationend event fires, the enter class is removed and the clone is no longer visible.

```tsx 
<div data-transition>
    <div className="overlay"/>

    <div className="item-wrapper">
        <div className="first-item"/>
        <div className="second-item"/>
    </div>

    {outside}
    {children}

    <CurrentPage  
        // Clone the page-wrapper      
        children={children}
    />

</div>
```


To access the page wrapper, overlays, item wrapper, and their respective items, use `useTransitionContext`.
```ts
import { useTransitionContext } from "page-transition/css"

const {
    pageWrapper,
    overlays, 
    itemWrapper, 
    firstItems, 
    secondItems 
}   = useTransitionContext()
```

#### CSS/SCSS Examples
<details>
<summary>Opacity</summary>
<br/>
options

```ts
overlays: 1

```

```css
[data-transition] .overlay{
    position: fixed;
    z-index: 98;
    inset: 0;
    background: white;
    
    opacity: 0;
    will-change: opacity;
    pointer-events: none;
}
@keyframes exit{
    0%{
        opacity: 0;
    }
    100%{
        opacity: 1;
    }
}
[data-transition].exit .overlay{  
   animation: exit 0.4s ease forwards;
}
@keyframes enter{
    0%{
        opacity: 1;
    }
    100%{
        opacity: 0;
    }
}
[data-transition].enter .overlay{
    opacity: 1;
    animation: enter 0.5s ease forwards;
}
```
</details>

<details>
<summary>Combined Opacity and Clip-Path</summary>
<br/>
options

```ts
overlays: 2
```
  
```css
[data-transition] .overlay:nth-child(1){
    position: fixed;
    z-index: 98;
    inset: 0;
    background: white;
    
    opacity: 0;
    pointer-events: none;
}
@keyframes exit{
    0%{
        opacity: 0;
    }
    100%{
        opacity: 1;
    }
}
[data-transition].exit .overlay:nth-child(1){  
   animation: exit 0.4s ease forwards;
}
@keyframes enter{
    0%{
        opacity: 1;
    }
    100%{
        opacity: 0;
    }
}
[data-transition].enter .overlay:nth-child(1){
    opacity: 1;
    animation: enter 0.5s ease forwards;
}

[data-transition] .overlay:nth-child(2){
    position: fixed;
    z-index: 99;
    inset: 0;

    background: black;
    transition: none;
    clip-path: inset(100% 0 0 0);
    will-change: clip-path;
    pointer-events: none;
}
@keyframes overlayExit{
    0%{
        clip-path: inset(100% 0 0 0);
    }
    100%{
        clip-path: inset(0 0 0 0);
    }
}
[data-transition].exit .overlay:nth-child(2){
    
    animation: overlayExit 1.2s ease forwards;
}
@keyframes overlayEnter{
    0%{
        clip-path: inset(0 0 0 0);
    }
    100%{
        clip-path: inset(0 0 100% 0);
    }
}
[data-transition].enter .overlay:nth-child(2){
    clip-path: inset(0 0 0 0);
    animation: overlayEnter 1.2s ease forwards;
}
```
</details>

<details>
<summary>Staggered Overlays</summary>
<br/>
options
  
```ts
items: [10, 0]
```

```scss
[data-transition] .item-wrapper{
    position: fixed;
    z-index: 98;
    inset: 0;

    display: grid;
    grid-template-columns: repeat(10, 1fr);
    pointer-events: none;
}
[data-transition] .first-item{
    background: black;
    will-change: clip-path;
    clip-path: inset(100% -1px 0 -1px);
}
@keyframes firstExit{
    0%{
        clip-path: inset(100% -1px 0 -1px);
    }
    100%{
        clip-path: inset(0 -1px 0 -1px);
    }
}
[data-transition].exit .first-item{
    animation: firstExit 1.0s ease forwards;
    @for $i from 0 to 10{
        &:nth-child(#{$i+1}){
            animation-delay: $i * 0.2s;
        }
    }
}
@keyframes firstEnter{
    0%{
        clip-path: inset(0 -1px 0 -1px);
    }
    100%{
        clip-path: inset(0 -1px 100% -1px);
    }
}
[data-transition].enter .first-item{
    clip-path: inset(0 -1px 0 -1px);
    animation: firstEnter 1.0s ease forwards;
    @for $i from 0 to 10{
        &:nth-child(#{$i+1}){
            animation-delay: $i * 0.2s;
        }
    }
}
```
</details>

<details>
<summary>Mirrored Staggered Overlays</summary>
<br/>
options

```ts
items: [10, 10]
```

```scss
[data-transition] .item-wrapper{
    position: fixed;
    z-index: 98;
    inset: 0;

    display: grid;
    grid-template-columns: repeat(10, 1fr);
    grid-template-rows: repeat(2, 1fr);
    pointer-events: none;
}
[data-transition] .first-item{
    grid-row: 1;
    background: black;
  
    will-change: clip-path;
    clip-path: inset(0 -1px 100% -1px);
}
@keyframes firstExit{
    0%{
        clip-path: inset(0 -1px 100% -1px);
    }
    100%{
        clip-path: inset(0 -1px 0 -1px);
    }
}
[data-transition].exit .first-item{
    grid-row: 1;
    
    animation: firstExit 1.2s ease forwards;
    @for $i from 0 to 10{
        &:nth-child(#{$i+1}){
            animation-delay: $i * 0.3s;
        }
    }
}
@keyframes firstEnter{
    0%{
        clip-path: inset(0 -1px 0 -1px);
    }
    100%{
        clip-path: inset(0 -1px 100% -1px);
    }
}
[data-transition].enter .first-item{
    grid-row: 1;
    clip-path: inset(0 -1px 0 -1px);
    animation: firstEnter 1.2s ease forwards;
    @for $i from 0 to 10{
        &:nth-child(#{$i+1}){
            animation-delay: $i * 0.3s;
        }
    }
}
// .second-item

[data-transition] .second-item{
    grid-row: 2;
    background: black;
    
    will-change: clip-path;
    clip-path: inset(100% -1px 0 -1px);
}
@keyframes secondExit{
    0%{
        clip-path: inset(100% -1px 0 -1px);
    }
    100%{
        clip-path: inset(0 -1px 0 -1px);
    }
}
[data-transition].exit .second-item{
    grid-row: 2;
    animation: secondExit 1.2s ease forwards;
    @for $i from 0 to 10{
        &:nth-child(#{$i+11}){
            animation-delay: $i * 0.3s;
        }
    }
}
@keyframes secondEnter{
    0%{
        clip-path: inset(0 -1px 0 -1px);
    }
    100%{
        clip-path: inset(100% -1px 0 -1px);
    }
}
[data-transition].enter .second-item{
    grid-row: 2;
    clip-path: inset(0 -1px 0 -1px);
    animation: secondEnter 1.2s ease forwards;
    @for $i from 0 to 10{
        &:nth-child(#{$i+11}){
            animation-delay: $i * 0.3s;
        }
    }
}

```
</details>


### Manual Mode  

In manual mode, you can control the transition using `useTransitionContext`.


After triggering the navigation, `state.current` is set to `exiting`. You can then call `resolveFn.current()` to hide the clone.

After calling resolveFn.current(), the scroll position is restored and state.current is set to `entering`.

Once the animation finishes, `state.current` should be set to `idle`.

```ts
import { useTransitionContext } from "page-transition/manual"

const { resolveFn, state } = useTransitionContext()

```

## Hooks

**useActiveLink**  
Automatically adds the active class to the element when its href matches.

```tsx
import { useActiveLink } from "page-transition"

const { saveRef } = useActiveLink()

<li ref={saveRef(href)}>
    <TransitionLink href={href}>
        {linkName}
    </TransitionLink>
</li>

```

**useExitFinish**  
Returns true after the exit transition or when resolveFn is called.

```tsx
import { useExitFinish } from "page-transition"

const {exitFinish} = useExitFinish()
    
useEffect(()=>{
         
},[exitFinish])


```
