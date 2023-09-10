import { ReadonlySignal, useComputed, useSignal } from "@preact/signals"
import {
    Fetcher,
    Location,
    Navigation,
    Action as NavigationType,
    Path,
    To,
    createPath,
    resolveTo,
} from "@remix-run/router"
import { useContext, useEffect, useMemo, useState } from "preact/hooks"
import { FormImpl } from "./internal/components/FormImpl"
import { AwaitContext, RouteErrorContext } from "./internal/context"
import { useRouteContext, useRouterContext } from "./internal/hooks"
import { createURL, getPathContributingMatches, submitImpl } from "./internal/utils"
import {
    FetcherFormProps,
    FetcherWithComponents,
    NavigateFunction,
    NavigateOptions,
    SubmitFunction,
} from "./types"

export function useNavigationType(): ReadonlySignal<NavigationType> {
    let ctx = useRouterContext()
    return useComputed(() => ctx.state.value.historyAction)
}

export function useLocation(): ReadonlySignal<Location> {
    let ctx = useRouterContext()
    return useComputed(() => ctx.state.value.location)
}

export function useMatches() {
    let ctx = useRouterContext()
    return useComputed(() =>
        ctx.state.value.matches.map(match => ({
            id: match.route.id,
            pathname: match.pathname,
            params: match.params,
            data: ctx.state.value.loaderData[match.route.id] as unknown,
            handle: match.route.handle as unknown,
        })),
    )
}

export function useNavigation(): ReadonlySignal<Navigation> {
    let ctx = useRouterContext()
    return useComputed(() => ctx.state.value.navigation)
}

export function useLoaderData<T = unknown>(): ReadonlySignal<T> {
    return useRouteLoaderData<T>(useRouteContext().id)
}

export function useRouteLoaderData<T = unknown>(routeId: string): ReadonlySignal<T> {
    let ctx = useRouterContext()
    return useComputed(() => ctx.state.value.loaderData[routeId] as T)
}

export function useActionData<T = unknown>(): ReadonlySignal<T> {
    let ctx = useRouterContext()
    let routeId = useRouteContext().id
    return useComputed(() => ctx.state.value.actionData?.[routeId] as T)
}

export function useRouteError<T = unknown>(): ReadonlySignal<T> {
    let ctx = useRouterContext()
    let routeId = useRouteContext().id
    let errorCtx = useContext(RouteErrorContext)

    // If this was a render error, we put it in a RouteError context inside
    // of RenderErrorBoundary. Otherwise look for errors from our data router
    // state
    return useComputed(() => (errorCtx?.error || ctx.router.state.errors?.[routeId]) as T)
}

/**
 * Returns the happy-path data from the nearest ancestor <Await /> value
 */
export function useAsyncValue(): unknown {
    let value = useContext(AwaitContext)
    return value?._data
}

/**
 * Returns the error from the nearest ancestor <Await /> value
 */
export function useAsyncError(): unknown {
    let value = useContext(AwaitContext)
    return value?._error
}

export function useResolvedPath(to: To): ReadonlySignal<Path> {
    let { matches } = useRouteContext()
    let location = useLocation()

    return useComputed(() =>
        resolveTo(
            to,
            getPathContributingMatches(matches).map(match => match.pathnameBase),
            location.value.pathname,
        ),
    )
}

export function useHref(to: To): ReadonlySignal<string> {
    let { router } = useRouterContext()
    let path = useResolvedPath(to)

    return useComputed(() => router.createHref(createURL(router, createPath(path.value))))
}

export function useNavigate(): NavigateFunction {
    let { router } = useRouterContext()
    let { matches } = useRouteContext()
    let location = useLocation()

    let navigate: NavigateFunction = (to: To | number, options: NavigateOptions = {}) => {
        if (typeof to === "number") {
            router.navigate(to)
            return
        }

        let path = resolveTo(
            to,
            getPathContributingMatches(matches).map(match => match.pathnameBase),
            location.value.pathname,
        )

        router.navigate(path, {
            replace: options.replace,
            state: options.state,
        })
    }

    return navigate
}

export function useFormAction(action = "."): string {
    let { matches } = useRouteContext()
    let route = useRouteContext()
    let location = useLocation()

    let path = resolveTo(
        action,
        getPathContributingMatches(matches).map(match => match.pathnameBase),
        location.value.pathname,
    )

    let search = path.search
    if (action === "." && route.index) {
        search = search ? search.replace(/^\?/, "?index&") : "?index"
    }

    return path.pathname + search
}

export function useSubmit(): SubmitFunction {
    let { router } = useRouterContext()
    let defaultAction = useFormAction()

    let submit: SubmitFunction = (target, options = {}) => {
        submitImpl(router, defaultAction, target, options)
    }

    return submit
}

let fetcherId = 0

export function useFetcher<TData = unknown>(): FetcherWithComponents<TData> {
    let { router } = useRouterContext()
    let { id } = useRouteContext()
    let defaultAction = useFormAction()
    let [fetcherKey] = useState(() => String(++fetcherId))
    let fetcher = useSignal<Fetcher<TData>>(router.getFetcher<TData>(fetcherKey))

    useEffect(() => {
        let unsubscribe = router.subscribe(() => {
            fetcher.value = router.getFetcher<TData>(fetcherKey)
        })

        return () => {
            unsubscribe()
            router.deleteFetcher(fetcherKey)
        }
    }, [fetcherKey])

    function Form({ replace = false, onSubmit, children, ...props }: FetcherFormProps) {
        return (
            <FormImpl
                replace={replace}
                onSubmit={onSubmit}
                fetcherKey={fetcherKey}
                routeId={id}
                {...props}
            >
                {children}
            </FormImpl>
        )
    }

    return useMemo(
        () => ({
            fetcher,
            Form,
            submit(target, options = {}) {
                return submitImpl(router, defaultAction, target, options, fetcherKey, id)
            },
            load(href) {
                return router.fetch(fetcherKey, id, href)
            },
        }),
        [Form],
    )
}

// FIXME: Should this be a computed?
export function useFetchers(): Fetcher[] {
    let { state } = useRouterContext()
    return [...state.value.fetchers.values()]
}
