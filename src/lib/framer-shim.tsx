// Adaptador para os componentes que vieram do Framer.
// Substitui só o que eles usavam do pacote "framer": Link, useIsStaticRenderer,
// addPropertyControls e ControlType (estes dois últimos não fazem nada fora do Framer).
import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react"

export function useIsStaticRenderer() {
    return false
}

export function addPropertyControls(_component: unknown, _controls: unknown) {}

export const ControlType: Record<string, string> = new Proxy({}, { get: (_t, key) => String(key) })

export function Link({ href, children }: { href: string; openInNewTab?: boolean; children: ReactNode }) {
    const child = Children.only(children)
    if (!isValidElement(child)) return <>{children}</>
    return cloneElement(child as ReactElement<{ href?: string }>, { href })
}
