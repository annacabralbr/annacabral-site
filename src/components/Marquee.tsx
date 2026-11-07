// Faixa de nomes com letras vazadas, separados por ponto, rolando sem parar.
// Contorno limpo: a fonte tem partes sobrepostas (ex.: barra do "e"), que o text-stroke comum
// desenha como riscos. Cada nome é desenhado duas vezes: embaixo com contorno de 2px, em cima
// só o preenchimento na cor do fundo, que cobre os riscos. Sobra só a borda de fora.
// Pausa fora da tela e fica parada com "reduzir movimento".
import { useRef, useId, type CSSProperties } from "react"
import { motion, useInView, useReducedMotion } from "framer-motion"

interface MarqueeProps {
    items: string[]
    speed?: number
    fontSize?: number
    color?: string
    fill?: string
    reverse?: boolean
}

const CONTAINER = { containerType: "inline-size" } as unknown as CSSProperties

export default function Marquee(props: MarqueeProps) {
    const { items, speed = 30, fontSize = 88, color = "#15140F", fill = "#EDEDEA", reverse = false } = props
    const ref = useRef<HTMLDivElement>(null)
    const inView = useInView(ref)
    const reduce = useReducedMotion()
    const run = !reduce && inView
    const cls = "mq" + useId().replace(/[^a-zA-Z0-9]/g, "")
    const size = Math.round(fontSize * 0.95)
    const tablet = Math.round(size * 0.7)
    const mobile = Math.max(28, Math.round(size * 0.46))
    const css = `@container (max-width: 999px){.${cls}{font-size:${tablet}px !important}}@container (max-width: 559px){.${cls}{font-size:${mobile}px !important}}`
    const duration = Math.max(10, (items.join(" ").length * 18) / Math.max(1, speed))
    const word: CSSProperties = { padding: "0 0.45em", whiteSpace: "nowrap", display: "inline-block" }

    const row = (
        <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            {items.map((t, i) => (
                <span key={i} style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ position: "relative", display: "inline-block" }}>
                        <span style={{ ...word, color: fill, WebkitTextStroke: `2px ${color}` }}>{t}</span>
                        <span style={{ ...word, position: "absolute", inset: 0, color: fill }}>{t}</span>
                    </span>
                    <span style={{ color, opacity: 0.35, fontSize: "0.4em" }}>●</span>
                </span>
            ))}
        </div>
    )

    return (
        <div ref={ref} role="img" aria-label={items.join(", ")} style={{ position: "relative", width: "100%", overflow: "hidden", ...CONTAINER }}>
            <style>{css}</style>
            <div className={cls} aria-hidden="true" style={{ fontFamily: "'Inter Tight', 'Inter', system-ui, sans-serif", fontWeight: 700, fontSize: size, lineHeight: 1.1, letterSpacing: "-0.03em", padding: "0.19em 0" }}>
                <motion.div
                    style={{ display: "flex", width: "max-content" }}
                    animate={run ? { x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] } : { x: "0%" }}
                    transition={run ? { duration, ease: "linear", repeat: Infinity } : { duration: 0 }}
                >
                    {row}
                    {row}
                </motion.div>
            </div>
        </div>
    )
}
