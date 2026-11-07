// Botão em pílula. "primary" é preenchido com a tinta; os outros são de contorno e se
// preenchem no hover. A seta troca no hover e o botão é levemente magnético.
// "anchor" rola suavemente até uma seção da página. Sem efeito com "reduzir movimento".
import { useRef, useState, startTransition, type MouseEvent } from "react"
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion"

interface PillButtonProps {
    label: string
    link?: string
    anchor?: string
    newTab?: boolean
    primary?: boolean
    ink?: string
    fontSize?: number
}

const FONT = "'Inter Tight', 'Inter', system-ui, sans-serif"
const isLight = (c: string) => /fafaf7|f4f2ec|#fff/i.test(c)

export default function PillButton(props: PillButtonProps) {
    const { label, link = "", anchor = "", newTab = false, primary = false, ink = "#15140F", fontSize = 17 } = props
    const reduce = useReducedMotion()
    const animate = !reduce
    const ref = useRef<HTMLAnchorElement>(null)
    const [hover, setHover] = useState(false)
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const sx = useSpring(x, { stiffness: 250, damping: 20 })
    const sy = useSpring(y, { stiffness: 250, damping: 20 })
    const anchorId = anchor.replace(/^#/, "")
    const href = anchorId ? `#${anchorId}` : link

    const contrast = isLight(ink) ? "#15140F" : "#FAFAF7"
    const bg = primary || hover ? ink : "transparent"
    const fg = primary || hover ? contrast : ink
    const size = Math.max(14, Math.min(18, Math.round(fontSize * 0.9)))
    const text = label.replace(/\s*[↗→↓]\s*$/, "")
    const arrow = (label.match(/[↗→↓]\s*$/) || ["→"])[0].trim()

    const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
        if (!anchorId) return
        const el = document.getElementById(anchorId)
        if (!el) return
        e.preventDefault()
        el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" })
        history.replaceState(null, "", `#${anchorId}`)
    }

    return (
        <motion.a
            ref={ref}
            href={href}
            onClick={onClick}
            target={newTab ? "_blank" : undefined}
            rel={newTab ? "noopener noreferrer" : undefined}
            onMouseEnter={() => startTransition(() => setHover(true))}
            onFocus={() => startTransition(() => setHover(true))}
            onBlur={() => startTransition(() => setHover(false))}
            onMouseMove={(e) => {
                if (!animate || !ref.current) return
                const r = ref.current.getBoundingClientRect()
                x.set((e.clientX - (r.left + r.width / 2)) * 0.12)
                y.set((e.clientY - (r.top + r.height / 2)) * 0.2)
            }}
            onMouseLeave={() => {
                x.set(0)
                y.set(0)
                startTransition(() => setHover(false))
            }}
            whileTap={animate ? { scale: 0.97 } : undefined}
            style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                x: sx,
                y: sy,
                padding: `${Math.round(size * 0.95)}px ${Math.round(size * 1.6)}px`,
                minHeight: 48,
                boxSizing: "border-box",
                background: bg,
                color: fg,
                border: `1px solid ${ink}`,
                borderRadius: 999,
                opacity: primary && hover ? 0.88 : 1,
                fontFamily: FONT,
                fontWeight: 500,
                fontSize: size,
                letterSpacing: "-0.005em",
                textDecoration: "none",
                whiteSpace: "nowrap",
                maxWidth: "100%",
                cursor: "pointer",
                transition: "background .45s cubic-bezier(.33,1,.68,1), color .45s cubic-bezier(.33,1,.68,1), opacity .45s",
            }}
        >
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{text}</span>
            <span aria-hidden="true" style={{ display: "inline-block", overflow: "hidden", height: "1.2em", lineHeight: "1.2em" }}>
                <motion.span style={{ display: "block" }} animate={{ y: hover && animate ? "-1.2em" : "0em" }} transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}>
                    <span style={{ display: "block" }}>{arrow}</span>
                    <span style={{ display: "block" }}>{arrow}</span>
                </motion.span>
            </span>
        </motion.a>
    )
}
