import { PropsWithChildren } from "preact/compat"
import { RouteErrorContext } from "../context"

export namespace ErrorWrapper {
    export interface Props extends PropsWithChildren {
        error: unknown
    }
}

export function ErrorWrapper({ error, children }: ErrorWrapper.Props) {
    return <RouteErrorContext.Provider value={{ error }}>{children}</RouteErrorContext.Provider>
}
