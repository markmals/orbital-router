import { JSXInternal } from "preact/src/jsx"
import { FormImpl } from "../internal/components/FormImpl"

export namespace Form {
    export type Props = JSXInternal.HTMLAttributes<HTMLFormElement> & {
        replace?: boolean
    }
}

export function Form(props: Form.Props) {
    return <FormImpl {...props} />
}
