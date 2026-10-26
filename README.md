# <img src="./assets/logo.svg" width="32"/>&nbsp;&nbsp;page-transition
A page transition library for the Next.js App Router.
<br/>    
[![Live Demo ↗](https://img.shields.io/badge/Live_Demo_%E2%86%97-000000?style=for-the-badge)](https://simon-schindler.github.io/page-transition-demo/)
  
   
## Features

- CSS & Manual mode
- Scroll restoration

## Install  
![Version](https://img.shields.io/badge/v_0.1.0--beta.52-000000) ![68.7 KB](https://img.shields.io/badge/68.7_KB-1677FF)  
  
  `npm install page-transition@beta`  
  
  ## Usage
Import your page transition styles and wrap your page content with `TransitionProvider` in your root layout.

```tsx
import { TransitionProvider } from "page-transition"
import '.../your-page-transition-styles.css'

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
| outside | JSX | - | CSS |
| options | *Options* | {} | CSS |

*Options*

| Option | Type | Default | Required |
|---|---|---|---|
| transitionProperty | "opacity" \| "clip-path" \| "transform" | - | Yes |
| items | [number, number] | [0, 0] | - |


**Prop Descriptions**

**mode**  
Select the transition mode.

**outside**  
Components rendered outside .page-wrapper, but still inside the transition container.

**options.transitionProperty**  
Defines which property transitionend waits for.  
  
**options.items**
<br/>
`options.items[0]`
Number of items in the first group. Each item receives the `.overlay-item` class.
<br/>
`options.items[1]`
Number of items in the second group. Each item receives the `.second-item` class.


```tsx
<TransitionProvider
outside={<Header/>}
options={{
  transitionProperty: "clip-path",
  items: [1, 0]
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
| prefetch | "auto" \| null | null | - |
| onClick | (e: React.MouseEvent)=>void | - | - |

**Prop Descriptions**  
TransitionLink uses the Next.js Link component internally. For details about navigation behavior and supported props, refer to the official Next.js documentation.

**Description**  
Triggers the transition. 

*Must be used within the TransitionProvider*  

```tsx
<TransitionLink href={"/home"}>
  Home
</TransitionLink>
```

### CSS Mode

The `TransitionProvider` uses a container with a `data-transition` attribute. When navigation starts, it adds the exit class and waits for the transitionend event of the configured transition property. By default, this is the `.page-wrapper` containing the page's children. If options.items is configured, the event is instead tracked on the last item of the first group.
<br/>
Once the transition ends, the scroll position is restored and navigation is performed.
<br/>
After navigation, the `exit` class is removed and the `enter` class is added. Once the next transitionend event fires, the enter class is removed.
<br/>
For overlay animations, an `.overlay-wrapper` is available. You can configure the number of overlay items using the options.items array.
<br/>

```tsx 
<div data-transition>
    {outside}
    {
        (options.items[0] > 0 ||  options.items[1] > 0) &&
        <div className="overlay-wrapper">
            ...
        </div>
    }
    <div className={"page-wrapper"}>
        {children}
    </div>
</div>
```
<br/>
To access the overlay wrapper and its items, use `useTransitionContext`.
<br/>

```ts
import { useTransitionContext } from "page-transition"

const { overlayWrapper, overlayItems } = useTransitionContext()
```

#### CSS/SCSS Examples
<details>
<summary>Opacity</summary>
<br/>
options

```ts
transitionProperty: "opacity"

```

```css
[data-transition] .page-wrapper{
    will-change: opacity;
    opacity: 1;
}
[data-transition].exit .page-wrapper{
   opacity: 0;  
   transition: opacity 0.4s ease;
   
}
[data-transition].enter .page-wrapper{
    opacity: 1;
    transition: opacity 0.5s ease;
}
```
</details>

<details>
<summary>Single Overlay</summary>
<br/>
options

```ts
transitionProperty: "clip-path"  
items: [1, 0]
```
  
```css
[data-transition] .page-wrapper{
    opacity: 1;
    transition: opacity 0.5s linear;
}
[data-transition].exit .page-wrapper{
    opacity: 0;
}
[data-transition].enter .page-wrapper{
    opacity: 1;
}

[data-transition] .overlay-wrapper{
    position: fixed;
    z-index: 99;
    inset: 0;

    display: grid;
    grid-template-columns: 1fr;
}
[data-transition] .overlay-item{
    background: black;
    transition: none;
    will-change: clip-path;
    clip-path: inset(100% 0 0 0);
}
[data-transition].exit .overlay-item{
    clip-path: inset(0 0 0 0);
    transition: clip-path 1.2s ease;
}
[data-transition].enter .overlay-item{
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
[data-transition] .overlay-wrapper{
    position: fixed;
    inset: 0;

    display: grid;
    grid-template-columns: repeat(10, 1fr);
}
[data-transition] .overlay-item{
    background: black;
    transition: none;
    will-change: clip-path;
    clip-path: inset(100% -1px 0 -1px);
}
[data-transition].exit .overlay-item{
    clip-path: inset(0 -1px 0 -1px);
    transition: clip-path 1.0s ease;
    @for $i from 0 to 10{
        &:nth-child(#{$i+1}){
            transition-delay: $i * 0.2s;
        }
    }
}
[data-transition].enter .overlay-item{
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
[data-transition] .overlay-wrapper{
    position: fixed;
    inset: 0;

    display: grid;
    grid-template-columns: repeat(10, 1fr);
    grid-template-rows: repeat(2, 1fr);
}
[data-transition] .overlay-item{
    grid-row: 1;
    background: black;
  
    transition: none;
    will-change: clip-path;
    clip-path: inset(0 -1px 100% -1px);
}
[data-transition].exit .overlay-item{
    grid-row: 1;
    clip-path: inset(0 -1px 0 -1px);
    transition: clip-path 1.2s ease;
    @for $i from 0 to 10{
        &:nth-child(#{$i+1}){
            transition-delay: $i * 0.3s;
        }
    }
}
[data-transition].enter .overlay-item{
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

After triggering the navigation, `state.current` is set to `exiting`. You can then call `resolveFn.current()` to proceed with the navigation. Once `state.current` is set to `entering`, the navigation has occurred. After the animation finishes, `state.current` should be set to `idle`.


```ts
import { useTransitionContext } from "page-transition"

const { resolveFn, state } = useTransitionContext()

```
