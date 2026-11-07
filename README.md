# page-transition
A page transition library for the Next.js App Router.
<br/>    
[![Live Demo ↗](https://img.shields.io/badge/Live_Demo_%E2%86%97-000000?style=for-the-badge)](https://simon-schindler.github.io/page-transition-demo/)
  
   
## Features

- CSS & Manual mode
- Scroll restoration

## Install  
![Version](https://img.shields.io/badge/v0.1.2-000000) ![83.1 KB](https://img.shields.io/badge/82.5_KB-1677FF)  
  
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
| outside | JSX | - | CSS |
| options | *Options* | {} | CSS |

*Options*

| Option | Type | Default | Required |
|---|---|---|---|
| transitionProperty | "opacity" \| "clip-path" \| "transform" | - | Yes |
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

**options.transitionProperty**  
Defines which property transitionend waits for.  


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
    overlays: 2,
    transitionProperty: "clip-path",
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
| scroll | boolean | true | - |
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

The `TransitionProvider` uses a container with a `data-transition` attribute. When navigation starts, it adds the `exit` class and waits for the transitionend event of the configured `transition property`.

By default, the event is tracked on `.page-wrapper`, which contains the page's children.

If `options.overlays` is greater than 0, the transition event is tracked on the last element of the overlay group.

If `options.items` specifies one or more items, the transition event is tracked on the last item of the first group.

The `.item-wrapper` is provided to group and position transition items. It is primarily intended for transitions that require multiple grouped elements. The number of items in each group can be configured using the options.items array.

Once the transition ends, the scroll position is restored and navigation is performed.

After navigation, the `exit` class is removed and the `enter` class is added. Once the next transitionend event fires, the enter class is removed.

```tsx 
<div data-transition>
    <div className="overlay"/>

    <div className="item-wrapper">
        <div className="first-item"/>
        <div className="second-item"/>
    </div>

    {outside}

    <div className={"page-wrapper"}>
        {children}
    </div>
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
transitionProperty: "opacity"
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
[data-transition].exit .overlay{
   opacity: 1;  
   transition: opacity 0.4s ease;
   
}
[data-transition].enter .overlay{
    opacity: 0;
    transition: opacity 0.5s ease;
}
```
</details>

<details>
<summary>Combined Opacity and Clip-Path</summary>
<br/>
options

```ts
transitionProperty: "clip-path"  
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
[data-transition].exit .overlay:nth-child(1){
   opacity: 1;  
   transition: opacity 0.4s ease;
   
}
[data-transition].enter .overlay:nth-child(1){
    opacity: 0;
    transition: opacity 0.5s ease;
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
[data-transition].exit .overlay:nth-child(2){
    clip-path: inset(0 0 0 0);
    transition: clip-path 1.2s ease;
}
[data-transition].enter .overlay:nth-child(2){
    clip-path: inset(0 0 100% 0);
    transition: clip-path 1.2s ease;
}
```
</details>

<details>
<summary>Staggered Overlays</summary>
<br/>
options
  
```ts
transitionProperty: "clip-path"  
items: [10, 0]
```

```scss
[data-transition] .item-wrapper{
    position: fixed;
    inset: 0;

    display: grid;
    grid-template-columns: repeat(10, 1fr);
    pointer-events: none;
}
[data-transition] .first-item{
    background: black;
    transition: none;
    will-change: clip-path;
    clip-path: inset(100% -1px 0 -1px);
}
[data-transition].exit .first-item{
    clip-path: inset(0 -1px 0 -1px);
    transition: clip-path 1.0s ease;
    @for $i from 0 to 10{
        &:nth-child(#{$i+1}){
            transition-delay: $i * 0.2s;
        }
    }
}
[data-transition].enter .first-item{
    clip-path: inset(0 -1px 100% -1px);
    transition: clip-path 1.0s ease;
    @for $i from 0 to 10{
        &:nth-child(#{$i+1}){
            transition-delay: $i * 0.2s;
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
transitionProperty: "clip-path"  
items: [10, 10]
```

```scss
[data-transition] .item-wrapper{
    position: fixed;
    inset: 0;

    display: grid;
    grid-template-columns: repeat(10, 1fr);
    grid-template-rows: repeat(2, 1fr);
    pointer-events: none;
}
[data-transition] .first-item{
    grid-row: 1;
    background: black;
  
    transition: none;
    will-change: clip-path;
    clip-path: inset(0 -1px 100% -1px);
}
[data-transition].exit .first-item{
    grid-row: 1;
    clip-path: inset(0 -1px 0 -1px);
    transition: clip-path 1.2s ease;
    @for $i from 0 to 10{
        &:nth-child(#{$i+1}){
            transition-delay: $i * 0.3s;
        }
    }
}
[data-transition].enter .first-item{
    grid-row: 1;
    clip-path: inset(0 -1px 100% -1px);
    transition: clip-path 1.2s ease;
    @for $i from 0 to 10{
        &:nth-child(#{$i+1}){
            transition-delay: $i * 0.3s;
        }
    }
}
// .second-item
[data-transition] .second-item{
    grid-row: 2;
    background: black;
    
    transition: none;
    will-change: clip-path;
    clip-path: inset(100% 0 0 0);
}
[data-transition].exit .second-item{
    grid-row: 2;
    clip-path: inset(0 -1px 0 -1px);
    transition: clip-path 1.2s ease;
    @for $i from 0 to 10{
        &:nth-child(#{$i+11}){
            transition-delay: $i * 0.3s;
        }
    }
}
[data-transition].enter .second-item{
    grid-row: 2;
    clip-path: inset(100% -1px 0 -1px);
    transition: clip-path 1.2s ease;
    @for $i from 0 to 10{
        &:nth-child(#{$i+11}){
            transition-delay: $i * 0.3s;
        }
    }
}

```
</details>


### Manual Mode  

In manual mode, you can control the transition using `useTransitionContext`.


After triggering the navigation, `state.current` is set to `exiting`. You can then call `resolveFn.current()` to proceed with the navigation.

Before navigating, you should call  
`window.scrollTo(0, window.history.state.scrollY ?? 0)`  
to restore the previous scroll position, or scroll to the top.

Once `state.current` is set to `entering`, the navigation has occurred. After the animation finishes, `state.current` should be set to `idle`.


```ts
import { useTransitionContext } from "page-transition/manual"

const { resolveFn, state } = useTransitionContext()

```