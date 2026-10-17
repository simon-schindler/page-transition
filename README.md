# page-transition
A page transition library for the Next.js App Router.  
  
  [![Live Demo ↗](https://img.shields.io/badge/Live_Demo_%E2%86%97-000000?style=for-the-badge)](https://simon-schindler.github.io/page-transition-demo/)
  
    
## Features

- CSS & Manual mode
- Scroll restoration

## Install

`npm install page-transition@beta`  
  
  ![66.4 KB](https://img.shields.io/badge/66.4 KB-gray)

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
| header | JSX | - | CSS |
| options | *Options* | {} | CSS |

*Options*

| Option | Type | Default |
|---|---|---|
| transitionProperty | "opacity" \| "clip-path" | "opacity" |
| overlayCount | number | 0 |

**Prop Descriptions**

**mode**  
Select the transition mode.

**header**  
The component rendered outside the transition container.

**options.transitionProperty**  
Defines which property transitionend waits for.

**options.overlayCount**  
Defines how many overlay items should be created.


```tsx
<TransitionProvider
header={<Header/>}
options={{
  transitionProperty: "clip-path",
  overlayCount: 1
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


```tsx
<TransitionLink href={"/home"}>
  Home
</TransitionLink>
```

### CSS Mode

The `TransitionProvider` uses a container with a `data-transition` attribute. When navigation starts, it adds the `exit` class and waits for the transitionend event of the configured transition property.

Once the transition ends, navigation is performed and the scroll position is restored using window.history.state.scrollY.

After navigation, the `exit` class is removed and the `enter` class is added. Once the next transitionend event fires, the enter class is removed.

For overlay animations, a `.overlay-wrapper` is available. You can add overlay items by setting the `overlayCount` option.

To access the overlay wrapper and its items, use `useTransitionContext`.

```ts
import { useTransitionContext } from "page-transition"

const {overlayWrapper, overlayItems} = useTransitionContext()

```

#### CSS/SCSS Examples
<details>
<summary>Opacity</summary>
<br/>
options

```ts
transitionProperty: "opacity"
overlayCount: 0
```

```css
[data-transition]{
    will-change: opacity;
    opacity: 1;
}
[data-transition].exit{
   opacity: 0;  
   transition: opacity 0.4s ease;
   
}
[data-transition].enter{
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
overlayCount: 1
```
  
```css
[data-transition] .overlay-wrapper{
    position: fixed;
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
overlayCount: 10
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

### Manual Mode

In manual mode, you can control the transition using `useTransitionContext`.

After triggering the navigation, `state.current` is set to `exiting`. You can then call `resolveFn.current()` to proceed with the navigation. Once `state.current` is set to `entering`, the new page has loaded. After the animation finishes, `state.current` should be set to `idle`.


```ts
import { useTransitionContext } from "page-transition"

const { resolveFn, state } = useTransitionContext()

```
