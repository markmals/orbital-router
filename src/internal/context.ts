import { TrackedPromise } from "@remix-run/router"
import { createContext } from "preact"
import { RouteContextObject, RouteErrorContextObject, RouterContextObject } from "../types"

export const RouterContext = createContext<RouterContextObject | null>(null)
export const RouteContext = createContext<RouteContextObject | null>(null)
export const RouteErrorContext = createContext<RouteErrorContextObject | null>(null)
export const AwaitContext = createContext<TrackedPromise | null>(null)
