import { Location } from "@remix-run/router"
import { VNode } from "preact"
import { DataRouteMatch } from "../../types"
import { useRouteContext, useRouterContext } from "../hooks"
import { DefaultErrorComponent } from "./DefaultErrorComponent"
import { ErrorBoundary } from "./ErrorBoundary"
import { RouteWrapper } from "./RouteWrapper"

export namespace OutletImpl {
    export interface Props {
        root?: boolean
    }
}

export function OutletImpl({ root = false }: OutletImpl.Props) {
    let { state, router } = useRouterContext()
    let routeContext = root ? null : useRouteContext()

    let { matches } = router.state
    let idx = matches.findIndex(m => m.route.id === routeContext?.id)

    if (idx < 0 && !root) {
        throw new Error(
            `Unable to find <Outlet /> match for route id: ${routeContext?.id || "_root_"}`,
        )
    }

    let matchToRender = matches[idx + 1]

    if (!matchToRender) {
        // We found an <Outlet /> but do not have deeper matching paths so we
        // end the render tree here
        return null
    }

    // Grab the error if we've reached the correct boundary.  Type must remain
    // unknown since user's can throw anything from a loader/action.
    let error: unknown =
        router.state.errors?.[matchToRender.route.id] != null
            ? Object.values(router.state.errors)[0]
            : null

    return renderRouteWrapper(matchToRender, state.value.location, root, error)
}

function renderRouteWrapper(
    match: DataRouteMatch,
    location: Location,
    root?: boolean,
    error?: unknown,
): VNode {
    return (
        <RouteWrapper
            id={match.route.id}
            index={match.route.index === true}
            key={`${match.route.id}:${location.key}`}
        >
            {root || error || match.route.ErrorBoundary ? (
                <ErrorBoundary
                    location={location}
                    component={match.route.ErrorBoundary || DefaultErrorComponent}
                    error={error}
                >
                    {match.route.Component && <match.route.Component />}
                </ErrorBoundary>
            ) : (
                // Otherwise just render the element, letting render errors bubble upwards
                match.route.Component && <match.route.Component />
            )}
        </RouteWrapper>
    )
}
