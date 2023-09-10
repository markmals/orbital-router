import { useContext } from "preact/hooks"
import invariant from "tiny-invariant"
import { RouteContextObject, RouterContextObject } from "../types"
import { RouteContext, RouterContext } from "./context"

export function useRouterContext(): RouterContextObject {
    let ctx = useContext(RouterContext)
    invariant(ctx != null, "No RouterContext available")
    return ctx
}

export function useRouteContext(): RouteContextObject {
    let ctx = useContext(RouteContext)
    invariant(ctx != null, "No RouteContext available")
    return ctx
}
