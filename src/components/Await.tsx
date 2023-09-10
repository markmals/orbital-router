/* eslint-disable @typescript-eslint/no-explicit-any */
import { TrackedPromise } from "@remix-run/router"
import { ComponentChild, ComponentChildren } from "preact"
import { useAsyncValue } from "../hooks"
import { AwaitErrorBoundary } from "../internal/components/AwaitErrorBoundary"

export interface AwaitResolveRenderFunction {
    (data: Awaited<any>): any
}

export interface AwaitProps {
    children: ComponentChildren | AwaitResolveRenderFunction
    errorElement?: ComponentChild
    resolve: TrackedPromise | any
}

/**
 * Component to use for rendering lazily loaded data from returning defer()
 * in a loader function
 */
export function Await({ children, errorElement, resolve }: AwaitProps) {
    return (
        <AwaitErrorBoundary resolve={resolve} errorElement={errorElement}>
            <ResolveAwait>{children}</ResolveAwait>
        </AwaitErrorBoundary>
    )
}

/**
 * @private
 * Indirection to leverage useAsyncValue for a render-prop API on <Await>
 */
function ResolveAwait({ children }: { children: ComponentChildren | AwaitResolveRenderFunction }) {
    let data = useAsyncValue()
    if (typeof children === "function") {
        return children(data)
    }
    return <>{children}</>
}
