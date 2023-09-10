/* eslint-disable @typescript-eslint/no-explicit-any */
import { Location } from "@remix-run/router"
import { Component, ComponentType } from "preact"
import { PropsWithChildren } from "preact/compat"
import { ErrorWrapper } from "./ErrorWrapper"

export namespace ErrorBoundary {
    export interface Props extends PropsWithChildren {
        location: Location
        component: ComponentType
        error?: unknown
    }

    export interface State {
        location: Location
        error: any
    }
}

export class ErrorBoundary extends Component<ErrorBoundary.Props, ErrorBoundary.State> {
    constructor(props: ErrorBoundary.Props) {
        super(props)
        this.state = {
            location: props.location,
            error: props.error,
        }
    }

    static getDerivedStateFromError(error: any) {
        return { error: error }
    }

    static getDerivedStateFromProps(props: ErrorBoundary.Props, state: ErrorBoundary.State) {
        // When we get into an error state, the user will likely click "back" to the
        // previous page that didn't have an error. Because this wraps the entire
        // application, that will have no effect--the error page continues to display.
        // This gives us a mechanism to recover from the error when the location changes.
        //
        // Whether we're in an error state or not, we update the location in state
        // so that when we are in an error state, it gets reset when a new location
        // comes in and the user recovers from the error.
        if (state.location !== props.location) {
            return {
                error: props.error,
                location: props.location,
            }
        }

        // If we're not changing locations, preserve the location but still surface
        // any new errors that may come through. We retain the existing error, we do
        // this because the error provided from the app state may be cleared without
        // the location changing.
        return {
            error: props.error || state.error,
            location: state.location,
        }
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error("Remix Router caught the following error during render", error, errorInfo)
    }

    render() {
        return this.state.error ? (
            <ErrorWrapper error={this.state.error} children={<this.props.component />} />
        ) : (
            this.props.children
        )
    }
}
