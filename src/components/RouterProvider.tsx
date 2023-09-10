import { useSignal } from "@preact/signals"
import { HydrationState, Router, RouterState } from "@remix-run/router"
import { useEffect } from "preact/hooks"
import { JSX } from "preact/jsx-runtime"
import { OutletImpl } from "../internal/components/OutletImpl"
import { RouterContext } from "../internal/context"

export namespace RouterProvider {
    export interface Props {
        router: Router
        fallbackElement?: JSX.Element
        hydrationData?: HydrationState
    }
}

export function RouterProvider({ router, fallbackElement }: RouterProvider.Props) {
    let state = useSignal<RouterState>(router.state)

    useEffect(() => {
        const unsubscribe = router.subscribe(s => (state.value = s))
        return () => unsubscribe()
    }, [])

    return (
        <RouterContext.Provider value={{ router, state }}>
            {!state.value.initialized ? (
                fallbackElement ? (
                    fallbackElement
                ) : (
                    <span />
                )
            ) : (
                <OutletImpl root={true} />
            )}
        </RouterContext.Provider>
    )
}
