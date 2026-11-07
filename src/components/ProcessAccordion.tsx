// Acordeão horizontal: cada etapa do processo é uma coluna com o título na vertical;
// ao passar o mouse, focar ou tocar, a coluna se abre e mostra a explicação.
// Em telas estreitas vira acordeão vertical (toque abre e fecha, + / −).
// Respeita "reduzir movimento".
import { useEffect, useRef, useState, startTransition } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"

interface Props {
    items: [string, string][]
    panelHeight?: number
}

const FONT = "'Inter Tight', 'Inter', system-ui, sans-serif"
const EASE = [0.22, 0.61, 0.36, 1] as const

export default function ProcessAccordion({ items, panelHeight = 460 }: Props) {
    const reduce = useReducedMotion()
    const [open, setOpen] = useState(0)
    const [wide, setWide] = useState(true)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const m = () => ref.current && startTransition(() => setWide(ref.current!.offsetWidth >= 820))
        m()
        const ro = new ResizeObserver(m)
        if (ref.current) ro.observe(ref.current)
        return () => ro.disconnect()
    }, [])

    const t = reduce ? { duration: 0 } : { duration: 0.6, ease: EASE }
    const border = "1px solid #DAD9D4"

    if (!wide) {
        return (
            <div ref={ref} style={{ width: "100%", display: "flex", flexDirection: "column", borderTop: border }}>
                {items.map(([title, body], i) => {
                    const isOpen = open === i
                    const num = String(i + 1).padStart(2, "0")
                    const id = `pa-body-${i}`
                    return (
                        <div key={i} style={{ borderBottom: border }}>
                            <button
                                type="button"
                                aria-expanded={isOpen}
                                aria-controls={id}
                                onClick={() => startTransition(() => setOpen(isOpen ? -1 : i))}
                                style={{ width: "100%", minHeight: 64, display: "flex", alignItems: "center", gap: 14, padding: "18px 0", background: "transparent", border: "none", textAlign: "left", cursor: "pointer", color: "#15140F", fontFamily: FONT }}
                            >
                                <span style={{ fontSize: 13, color: "#73716C", letterSpacing: "0.08em", width: 22, flex: "none" }}>{num}</span>
                                <span style={{ flex: 1, fontWeight: 700, fontSize: 22, letterSpacing: "-0.03em", lineHeight: 1.15 }}>{title}</span>
                                <motion.span aria-hidden="true" animate={{ rotate: isOpen ? 45 : 0 }} transition={t} style={{ fontSize: 26, lineHeight: 1, fontWeight: 400, flex: "none" }}>
                                    +
                                </motion.span>
                            </button>
                            <AnimatePresence initial={false}>
                                {isOpen && (
                                    <motion.div
                                        id={id}
                                        key="b"
                                        initial={reduce ? false : { height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={reduce ? undefined : { height: 0, opacity: 0 }}
                                        transition={t}
                                        style={{ overflow: "hidden" }}
                                    >
                                        <p style={{ margin: 0, padding: "0 0 22px 36px", fontFamily: FONT, fontSize: 16, lineHeight: 1.6, color: "#3A3934" }}>{body}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <div ref={ref} style={{ width: "100%", display: "flex", flexDirection: "row", border, background: "#FAFAF7" }}>
            {items.map(([title, body], i) => {
                const isOpen = open === i
                const num = String(i + 1).padStart(2, "0")
                return (
                    <motion.button
                        key={i}
                        type="button"
                        aria-expanded={isOpen}
                        onMouseEnter={() => startTransition(() => setOpen(i))}
                        onFocus={() => startTransition(() => setOpen(i))}
                        onClick={() => startTransition(() => setOpen(i))}
                        animate={{ flexGrow: isOpen ? 4 : 1, backgroundColor: isOpen ? "#EDEDEA" : "#FAFAF7" }}
                        transition={t}
                        style={{
                            flexBasis: 0,
                            minWidth: 0,
                            height: panelHeight,
                            border: "none",
                            borderLeft: i > 0 ? border : "none",
                            padding: "28px 28px 32px",
                            textAlign: "left",
                            cursor: "pointer",
                            position: "relative",
                            overflow: "hidden",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: !isOpen ? "space-between" : "flex-start",
                            gap: 20,
                            color: "#15140F",
                            fontFamily: FONT,
                        }}
                    >
                        {!isOpen ? (
                            <>
                                <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontWeight: 700, fontSize: 30, letterSpacing: "-0.03em", whiteSpace: "nowrap", alignSelf: "flex-start", marginTop: "auto" }}>{title}</span>
                                <span style={{ fontSize: 13, color: "#73716C", letterSpacing: "0.08em" }}>{num}</span>
                            </>
                        ) : (
                            <>
                                <span style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                                    <span style={{ fontSize: 13, color: "#73716C", letterSpacing: "0.08em" }}>{num}</span>
                                    <span style={{ fontWeight: 700, fontSize: 30, letterSpacing: "-0.03em", lineHeight: 1.1 }}>{title}</span>
                                </span>
                                <motion.span
                                    key="b"
                                    initial={reduce ? false : { opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ ...t, delay: reduce ? 0 : 0.15 }}
                                    style={{ fontSize: 17, lineHeight: 1.55, color: "#3A3934", maxWidth: 460, marginTop: "auto" }}
                                >
                                    {body}
                                </motion.span>
                            </>
                        )}
                    </motion.button>
                )
            })}
        </div>
    )
}
