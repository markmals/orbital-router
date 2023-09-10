/* eslint-disable @typescript-eslint/no-explicit-any */
import { AbortedDeferredError, TrackedPromise } from "@remix-run/router"
import { Component, ComponentChild, ComponentChildren } from "preact"
import { AwaitContext } from "../context"

type AwaitErrorBoundaryProps = {
    errorElement?: ComponentChild
    resolve: TrackedPromise | any
    children?: ComponentChildren
}

type AwaitErrorBoundaryState = {
    error: any
}

enum AwaitRenderStatus {
    pending,
    success,
    error,
}

const neverSettledPromise = new Promise(() => {})

export class AwaitErrorBoundary extends Component<
    AwaitErrorBoundaryProps,
    AwaitErrorBoundaryState
> {
    constructor(props: AwaitErrorBoundaryProps) {
        super(props)
        this.state = { error: null }
    }

    static getDerivedStateFromError(error: any) {
        return { error }
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error("<Await> caught the following error during render", error, errorInfo)
    }

    render() {
        let { children, errorElement, resolve } = this.props

        let promise: TrackedPromise | null = null
        let status: AwaitRenderStatus = AwaitRenderStatus.pending

        if (!(resolve instanceof Promise)) {
            // Didn't get a promise - provide as a resolved promise
            status = AwaitRenderStatus.success
            promise = Promise.resolve()
            Object.defineProperty(promise, "_tracked", { get: () => true })
            Object.defineProperty(promise, "_data", { get: () => resolve })
        } else if (this.state.error) {
            // Caught a render error, provide it as a rejected promise
            status = AwaitRenderStatus.error
            let renderError = this.state.error
            promise = Promise.reject().catch(() => {}) // Avoid unhandled rejection warnings
            Object.defineProperty(promise, "_tracked", { get: () => true })
            Object.defineProperty(promise, "_error", { get: () => renderError })
        } else if ((resolve as TrackedPromise)._tracked) {
            // Already tracked promise - check contents
            promise = resolve
            status =
                promise._error !== undefined
                    ? AwaitRenderStatus.error
                    : promise._data !== undefined
                    ? AwaitRenderStatus.success
                    : AwaitRenderStatus.pending
        } else {
            // Raw (untracked) promise - track it
            status = AwaitRenderStatus.pending
            Object.defineProperty(resolve, "_tracked", { get: () => true })
            promise = resolve.then(
                (data: any) => Object.defineProperty(resolve, "_data", { get: () => data }),
                (error: any) => Object.defineProperty(resolve, "_error", { get: () => error }),
            )
        }

        if (status === AwaitRenderStatus.error && promise._error instanceof AbortedDeferredError) {
            // Freeze the UI by throwing a never resolved promise
            throw neverSettledPromise
        }

        if (status === AwaitRenderStatus.error && !errorElement) {
            // No errorElement, throw to the nearest route-level error boundary
            throw promise._error
        }

        if (status === AwaitRenderStatus.error) {
            // Render via our errorElement
            return <AwaitContext.Provider value={promise} children={errorElement} />
        }

        if (status === AwaitRenderStatus.success) {
            // Render children with resolved value
            return <AwaitContext.Provider value={promise} children={children} />
        }

        // Throw to the suspense boundary
        throw promise
    }
}
