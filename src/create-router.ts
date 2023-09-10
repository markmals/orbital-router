import {
    HydrationState,
    createBrowserHistory,
    createHashHistory,
    createMemoryHistory,
    createRouter,
} from "@remix-run/router"
import { enhanceManualRouteObjects } from "./internal/utils"
import { RouteObject } from "./types"

interface CreateRouterOpts {
    basename?: string
    hydrationData?: HydrationState
}

interface CreateMemoryRouterOpts extends CreateRouterOpts {
    initialEntries?: string[]
    initialIndex?: number
}

interface CreateBrowserRouterOpts extends CreateRouterOpts {
    window?: Window
}

interface CreateHashRouterOpts extends CreateRouterOpts {
    window?: Window
}

export function createMemoryRouter(
    routes: RouteObject[],
    { basename, hydrationData, initialEntries, initialIndex }: CreateMemoryRouterOpts = {},
) {
    return createRouter({
        basename,
        history: createMemoryHistory({
            initialEntries,
            initialIndex,
        }),
        hydrationData,
        routes: enhanceManualRouteObjects(routes),
    }).initialize()
}

export function createBrowserRouter(
    routes: RouteObject[],
    { basename, hydrationData, window }: CreateBrowserRouterOpts = {},
) {
    return createRouter({
        basename,
        history: createBrowserHistory({ window }),
        hydrationData,
        routes: enhanceManualRouteObjects(routes),
    }).initialize()
}

export function createHashRouter(
    routes: RouteObject[],
    { basename, hydrationData, window }: CreateHashRouterOpts = {},
) {
    return createRouter({
        basename,
        history: createHashHistory({ window }),
        hydrationData,
        routes: enhanceManualRouteObjects(routes),
    }).initialize()
}
