import { useComputed } from "@preact/signals"
import { isRouteErrorResponse } from "@remix-run/router"
import { useRouteError } from "../../hooks"

export function DefaultErrorComponent() {
    let error = useRouteError()

    let stack = useComputed<string | undefined>(() => {
        if (error.value instanceof Error) {
            return error.value.stack
        }
    })

    let message = useComputed<string>(() => {
        if (isRouteErrorResponse(error.value)) {
            return `${error.value.status} ${error.value.statusText}`
        } else if (error.value instanceof Error) {
            return error.value.message
        } else {
            return JSON.stringify(error.value)
        }
    })

    let lightgrey = "rgba(200,200,200, 0.5)"
    let preStyles = { padding: "0.5rem", backgroundColor: lightgrey }
    let codeStyles = { padding: "2px 4px", backgroundColor: lightgrey }

    return (
        <>
            <h2>Unhandled Thrown Error!</h2>
            <h3 style={{ fontStyle: "italic" }}>{message}</h3>
            {stack && <pre style={preStyles}>{stack}</pre>}
            <p>💿 Hey developer 👋</p>
            <p>
                You can provide a way better UX than this when your app throws errors by providing
                your own <code style={codeStyles}>errorElement</code>
                props on your routes.
            </p>
        </>
    )
}
