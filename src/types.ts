/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReadonlySignal, Signal } from "@preact/signals"
import {
    AgnosticIndexRouteObject,
    AgnosticNonIndexRouteObject,
    AgnosticRouteMatch,
    Fetcher,
    LazyRouteFunction,
    Router,
    RouterState,
    StaticHandlerContext,
    To,
} from "@remix-run/router"
import { ComponentType, FunctionComponent } from "preact"
import { PropsWithChildren } from "preact/compat"
import { JSXInternal } from "preact/src/jsx"
import { SubmitOptions } from "./dom"

// Create Preact-specific types from the agnostic types in @remix-run/router to
// export from remix-router-preact-signals
export interface IndexRouteObject {
    caseSensitive?: AgnosticIndexRouteObject["caseSensitive"]
    path?: AgnosticIndexRouteObject["path"]
    id?: AgnosticIndexRouteObject["id"]
    loader?: AgnosticIndexRouteObject["loader"]
    action?: AgnosticIndexRouteObject["action"]
    hasErrorBoundary?: AgnosticIndexRouteObject["hasErrorBoundary"]
    shouldRevalidate?: AgnosticIndexRouteObject["shouldRevalidate"]
    handle?: AgnosticIndexRouteObject["handle"]
    index: true
    children?: undefined
    Component?: ComponentType | null
    ErrorBoundary?: ComponentType | null
    lazy?: LazyRouteFunction<RouteObject>
}

export interface NonIndexRouteObject {
    caseSensitive?: AgnosticNonIndexRouteObject["caseSensitive"]
    path?: AgnosticNonIndexRouteObject["path"]
    id?: AgnosticNonIndexRouteObject["id"]
    loader?: AgnosticNonIndexRouteObject["loader"]
    action?: AgnosticNonIndexRouteObject["action"]
    hasErrorBoundary?: AgnosticNonIndexRouteObject["hasErrorBoundary"]
    shouldRevalidate?: AgnosticNonIndexRouteObject["shouldRevalidate"]
    handle?: AgnosticNonIndexRouteObject["handle"]
    index?: false
    children?: RouteObject[]
    Component?: ComponentType | null
    ErrorBoundary?: ComponentType | null
    lazy?: LazyRouteFunction<RouteObject>
}

export type RouteObject = IndexRouteObject | NonIndexRouteObject

export type DataRouteObject = RouteObject & {
    children?: DataRouteObject[]
    id: string
}

export interface RouteMatch<
    ParamKey extends string = string,
    RouteObjectType extends RouteObject = RouteObject,
> extends AgnosticRouteMatch<ParamKey, RouteObjectType> {}

export interface DataRouteMatch extends RouteMatch<string, DataRouteObject> {}

// Global context holding the singleton router and the current state
export interface RouterContextObject {
    router: Router
    state: Signal<RouterState>
}

// Wrapper context holding the route location in the current hierarchy
export interface RouteContextObject {
    id: string
    matches: DataRouteMatch[]
    index: boolean
}

// Wrapper context holding the captured render error
export interface RouteErrorContextObject {
    error: unknown
}

export interface DataRouterContextObject extends NavigationContextObject {
    router: Router
    staticContext?: StaticHandlerContext
}

interface NavigationContextObject {
    basename: string
    navigator: Navigator
    static: boolean
}

export interface NavigateOptions {
    replace?: boolean
    state?: unknown
}

/**
 * The interface for the navigate() function returned from useNavigate().
 */
export interface NavigateFunction {
    (to: To, options?: NavigateOptions): void
    (delta: number): void
}

export type SubmitTarget =
    | HTMLFormElement
    | HTMLButtonElement
    | HTMLInputElement
    | FormData
    | URLSearchParams
    | { [name: string]: string }
    | null

export interface SubmitFunction {
    (
        /**
         * Specifies the `<form>` to be submitted to the server, a specific
         * `<button>` or `<input type="submit">` to use to submit the form, or some
         * arbitrary data to submit.
         *
         * Note: When using a `<button>` its `name` and `value` will also be
         * included in the form data that is submitted.
         */
        target: SubmitTarget,

        /**
         * Options that override the `<form>`'s own attributes. Required when
         * submitting arbitrary data without a backing `<form>`.
         */
        options?: SubmitOptions,
    ): void
}

export type FetcherFormProps = PropsWithChildren<
    {
        replace?: boolean
        onSubmit?: any
    } & JSXInternal.HTMLAttributes<HTMLFormElement>
>

export type FetcherWithComponents<TData> = {
    fetcher: ReadonlySignal<Fetcher<TData>>
    Form: FunctionComponent<FetcherFormProps>
    submit(
        target:
            | HTMLFormElement
            | HTMLButtonElement
            | HTMLInputElement
            | FormData
            | URLSearchParams
            | { [name: string]: string }
            | null,
        options?: SubmitOptions,
    ): void
    load: (href: string) => void
}
