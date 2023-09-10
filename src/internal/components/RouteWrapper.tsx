import { PropsWithChildren } from "preact/compat"
import { RouteContext } from "../context"
import { useRouterContext } from "../hooks"

export namespace RouteWrapper {
    export interface Props extends PropsWithChildren {
        id: string
        index: boolean
    }
}

export function RouteWrapper({ id, index, children }: RouteWrapper.Props) {
    let { state } = useRouterContext()
    // FIXME: I could probably memoize at least the matches with a computed
    // Would that actually realize perf gains?
    let ctx = {
        id,
        matches: state.value.matches.slice(
            0,
            state.value.matches.findIndex(m => m.route.id === id) + 1,
        ),
        index: index === true,
    }

    return <RouteContext.Provider value={ctx}>{children}</RouteContext.Provider>
}
