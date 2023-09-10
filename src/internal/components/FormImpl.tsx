/* eslint-disable @typescript-eslint/no-explicit-any */
import { Signal } from "@preact/signals"
import { FormMethod } from "@remix-run/router"
import { JSXInternal } from "preact/src/jsx"
import { useFormAction } from "../../hooks"
import { useRouterContext } from "../hooks"
import { submitImpl } from "../utils"

type HTMLFormSubmitter = HTMLButtonElement | HTMLInputElement

export namespace FormImpl {
    export interface Props extends JSXInternal.HTMLAttributes<HTMLFormElement> {
        replace?: boolean
        fetcherKey?: string | null
        routeId?: string | null
    }
}

export function FormImpl({
    replace = false,
    onSubmit,
    fetcherKey = null,
    routeId = null,
    ...props
}: FormImpl.Props) {
    let { router } = useRouterContext()
    let defaultAction = useFormAction(
        props.action instanceof Signal ? props.action.value : props.action,
    )

    return (
        <form
            onSubmit={event => {
                onSubmit && onSubmit(event)
                if (event.defaultPrevented) {
                    return
                }
                event.preventDefault()
                submitImpl(
                    router,
                    defaultAction,
                    ((event as any).submitter as HTMLFormSubmitter) || event.currentTarget,
                    {
                        method: props.method as FormMethod,
                        replace: replace,
                    },
                    fetcherKey ?? undefined,
                    routeId ?? undefined,
                )
            }}
            {...props}
        />
    )
}
