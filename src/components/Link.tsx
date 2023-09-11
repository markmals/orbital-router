import { ReadonlySignal, Signal, useComputed } from "@preact/signals"
import { ComponentChildren } from "preact"
import { CSSProperties } from "preact/compat"
import { Booleanish, JSXInternal } from "preact/src/jsx"
import { useLocation, useResolvedPath } from "../hooks"
import { shouldProcessLinkClick } from "../internal/dom"
import { useRouterContext } from "../internal/hooks"

export namespace Link {
    export type Props = Omit<JSXInternal.HTMLAttributes<HTMLAnchorElement>, "href"> & {
        to: string
    }
}

export function Link({ to, children, ...props }: Link.Props) {
    const { router } = useRouterContext()

    return (
        <a
            href={to}
            onClick={event => {
                let target = typeof props.target === "string" ? props.target : undefined
                if (!shouldProcessLinkClick(event, target)) {
                    return
                }
                event.preventDefault()
                router.navigate(to)
            }}
            children={children}
            {...props}
        />
    )
}

export namespace NavLink {
    export type State = {
        isActive: ReadonlySignal<boolean>
        isPending: ReadonlySignal<boolean>
    }

    export type Props = Omit<Link.Props, "class" | "style" | "children"> & {
        children?:
            | ComponentChildren
            | ReadonlySignal<ComponentChildren>
            | ((props: State) => ComponentChildren)
        caseSensitive?: boolean | ReadonlySignal<boolean>
        class?: string | ReadonlySignal<string> | ((props: State) => string | undefined)
        end?: boolean | ReadonlySignal<boolean>
        style?:
            | (CSSProperties | string)
            | ReadonlySignal<CSSProperties | string>
            | ((props: State) => (CSSProperties | string) | undefined)
    }
}

type AriaCurrent = "step" | Booleanish | "page" | "location" | "date" | "time" | undefined

export function NavLink({
    "aria-current": ariaCurrentProp = "page",
    caseSensitive = false,
    class: classNameProp = "",
    end = false,
    style: styleProp,
    to,
    children,
    ...rest
}: NavLink.Props) {
    // TODO: useResolvedPath: { relative: rest.relative }
    let path = useResolvedPath(to)
    let location = useLocation()
    let { state: routerState } = useRouterContext()
    // let { navigator } = useContext(NavigationContext)

    let toPathname = useComputed(() => {
        // navigator.encodeLocation
        //   ? navigator.encodeLocation(path).pathname
        //   : path.pathname

        if (!caseSensitive) {
            return path.value.pathname.toLowerCase()
        }

        return path.value.pathname
    })

    let locationPathname = useComputed(() => {
        if (!caseSensitive) {
            return location.value.pathname.toLowerCase()
        }

        return location.value.pathname
    })

    let nextLocationPathname = useComputed(() => {
        let pathname =
            routerState.value &&
            routerState.value.navigation &&
            routerState.value.navigation.location
                ? routerState.value.navigation.location.pathname
                : null

        if (!caseSensitive) {
            return pathname?.toLowerCase()
        }

        return null
    })

    let isActive = useComputed(
        () =>
            locationPathname.value === toPathname.value ||
            (!end &&
                locationPathname.value.startsWith(toPathname.value) &&
                locationPathname.value.charAt(toPathname.value.length) === "/"),
    )

    let isPending = useComputed(
        () =>
            nextLocationPathname.value != null &&
            (nextLocationPathname.value === toPathname.value ||
                (!end &&
                    nextLocationPathname.value.startsWith(toPathname.value) &&
                    nextLocationPathname.value.charAt(toPathname.value.length) === "/")),
    )

    let ariaCurrent = useComputed<AriaCurrent>(() =>
        isActive.value
            ? ariaCurrentProp instanceof Signal
                ? ariaCurrentProp.value
                : ariaCurrentProp
            : undefined,
    )

    let className = useComputed(() => {
        if (typeof classNameProp === "function") {
            return classNameProp({ isActive, isPending })
        } else if (classNameProp instanceof Signal) {
            return classNameProp.value
        } else {
            // If the className prop is not a function, we use a default `active` class for <NavLink />s that are active.
            return [classNameProp, isActive ? "active" : null, isPending ? "pending" : null]
                .filter(Boolean)
                .join(" ")
        }
    })

    let style = useComputed<CSSProperties | string | undefined>(() => {
        if (typeof styleProp === "function") {
            return styleProp({ isActive, isPending })
        } else if (styleProp instanceof Signal) {
            return styleProp.value
        } else {
            return styleProp
        }
    })

    let reactiveChildren = useComputed<ComponentChildren>(() => {
        if (typeof children === "function") {
            return children({ isActive, isPending })
        } else if (children instanceof Signal) {
            return children.value
        } else {
            return children
        }
    })

    return (
        <Link {...rest} aria-current={ariaCurrent} class={className} style={style} to={to}>
            {reactiveChildren}
        </Link>
    )
}
