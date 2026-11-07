// Hero minimalista: título em linhas mascaradas que sobem em sequência; a última palavra
// alterna (dados, pessoas, negócio, pesquisa) em tom secundário.
// Respeita "reduzir movimento". Tamanho menor pela largura do bloco (container query).
import { useEffect, useId, useRef, useState, startTransition, type CSSProperties } from "react"
import { motion, AnimatePresence, useInView, useReducedMotion } from "framer-motion"

interface HeroTitleProps {
    text?: string
    words?: string
    fontSize?: number
    color?: string
    interval?: number
}

const FONT = "'Inter Tight', 'Inter', system-ui, sans-serif"
const EASE = [0.22, 0.61, 0.36, 1] as const
const CONTAINER = { containerType: "inline-size" } as unknown as CSSProperties

export default function HeroTitle(props: HeroTitleProps) {
    const {
        text = "Design de produto|orientado por",
        words = "dados., pessoas., negócio., pesquisa.",
        fontSize = 132,
        color = "#15140F",
        interval = 2200,
    } = props
    const lines = text.split("|").map((s) => s.trim()).filter(Boolean)
    const rotating = words.split(",").map((s) => s.trim()).filter(Boolean)
    const reduce = useReducedMotion()
    const ref = useRef<HTMLDivElement>(null)
    const inView = useInView(ref, { margin: "0px 0px -10% 0px" })
    const [i, setI] = useState(0)
    const animate = !reduce
    const cls = "ht" + useId().replace(/[^a-zA-Z0-9]/g, "")
    const size = Math.round(fontSize * 0.9)
    const tablet = Math.round(size * 0.62)
    const mobile = Math.max(36, Math.round(size * 0.34))
    const css = `@container (max-width: 999px){.${cls}{font-size:${tablet}px !important}}@container (max-width: 559px){.${cls}{font-size:${mobile}px !important;line-height:1.02 !important}}`

    useEffect(() => {
        if (!animate || !inView || rotating.length < 2) return
        const id = window.setInterval(() => startTransition(() => setI((n) => (n + 1) % rotating.length)), interval)
        return () => window.clearInterval(id)
    }, [animate, inView, rotating.length, interval])

    const mask: CSSProperties = { display: "block", overflow: "hidden", paddingBottom: "0.1em", marginBottom: "-0.1em" }

    return (
        <div ref={ref} style={{ position: "relative", width: "100%", ...CONTAINER }}>
            <style>{css}</style>
            <h1
                aria-label={`${lines.join(" ")} ${rotating.join(" ")}`}
                className={cls}
                style={{ position: "relative", width: "100%", margin: 0, fontFamily: FONT, fontWeight: 700, fontSize: size, lineHeight: 0.98, letterSpacing: "-0.045em", color }}
            >
                {lines.map((line, li) => (
                    <span key={li} style={mask} aria-hidden="true">
                        <motion.span
                            style={{ display: "block" }}
                            initial={animate ? { y: "105%" } : false}
                            animate={{ y: "0%" }}
                            transition={{ duration: 0.9, delay: 0.1 + li * 0.09, ease: EASE }}
                        >
                            {line}
                        </motion.span>
                    </span>
                ))}
                <span style={mask} aria-hidden="true">
                    <motion.span
                        style={{ display: "block", position: "relative" }}
                        initial={animate ? { y: "105%" } : false}
                        animate={{ y: "0%" }}
                        transition={{ duration: 0.9, delay: 0.1 + lines.length * 0.09, ease: EASE }}
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.span
                                key={i}
                                style={{ display: "inline-block", whiteSpace: "nowrap", opacity: 0.4 }}
                                initial={animate ? { y: "60%", opacity: 0 } : false}
                                animate={{ y: "0%", opacity: 0.4 }}
                                exit={animate ? { y: "-60%", opacity: 0 } : undefined}
                                transition={{ duration: 0.5, ease: EASE }}
                            >
                                {rotating[i] ?? ""}
                            </motion.span>
                        </AnimatePresence>
                    </motion.span>
                </span>
            </h1>
        </div>
    )
}
