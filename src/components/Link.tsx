import { JSXInternal } from "preact/src/jsx"
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
