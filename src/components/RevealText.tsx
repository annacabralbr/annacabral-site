// Título que entra por linhas mascaradas (cada palavra sobe de dentro de uma máscara).
// Palavras em "highlight" ficam em tom secundário. Estático com "reduzir movimento".
// Tamanho menor pela largura do próprio bloco (container query).
import { useId, type CSSProperties } from "react"
import { motion, useReducedMotion } from "framer-motion"

interface RevealTextProps {
    text: string
    highlight?: string
    tag?: "h1" | "h2" | "h3" | "p"
    fontSize?: number
    color?: string
    align?: "left" | "center"
}

const FAMILY = "'Inter Tight', 'Inter', system-ui, sans-serif"
const EASE = [0.22, 0.61, 0.36, 1] as const
const CONTAINER = { containerType: "inline-size" } as unknown as CSSProperties

export default function RevealText(props: RevealTextProps) {
    const { text, highlight = "", tag = "h2", fontSize = 64, color = "#15140F", align = "left" } = props
    const reduce = useReducedMotion()
    const animate = !reduce
    const cls = "rt" + useId().replace(/[^a-zA-Z0-9]/g, "")
    const Tag: any = tag
    const words = text.split(" ")
    const marks = highlight.split(" ").filter(Boolean)
    const size = Math.round(fontSize * 0.78)
    const mobile = Math.min(size, Math.max(28, Math.round(size * 0.5)))
    const tablet = Math.min(size, Math.max(mobile, Math.round(size * 0.72)))
    const css = `@container (max-width: 759px){.${cls}{font-size:${tablet}px !important}}@container (max-width: 559px){.${cls}{font-size:${mobile}px !important;line-height:1.08 !important}}`

    return (
        <div style={{ position: "relative", width: "100%", ...CONTAINER }}>
            <style>{css}</style>
            <Tag
                aria-label={text}
                className={cls}
                style={{
                    position: "relative",
                    width: "100%",
                    margin: 0,
                    fontFamily: FAMILY,
                    fontWeight: 700,
                    fontSize: size,
                    lineHeight: 1,
                    letterSpacing: "-0.035em",
                    color,
                    textAlign: align,
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: align === "center" ? "center" : "flex-start",
                    columnGap: "0.24em",
                }}
            >
                {words.map((w, i) => {
                    const hl = marks.includes(w)
                    return (
                        <span key={i} aria-hidden="true" style={{ display: "inline-block", overflow: "hidden", paddingBottom: "0.12em", marginBottom: "-0.12em" }}>
                            <motion.span
                                style={{ display: "inline-block", color, opacity: hl ? 0.42 : 1 }}
                                initial={animate ? { y: "105%" } : false}
                                whileInView={{ y: "0%" }}
                                viewport={{ once: true, margin: "0px 0px -8% 0px" }}
                                transition={{ duration: 0.8, delay: Math.min(i * 0.035, 0.6), ease: EASE }}
                            >
                                {w}
                            </motion.span>
                        </span>
                    )
                })}
            </Tag>
        </div>
    )
}
