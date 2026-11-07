// Pílula escura fixa no rodapé central, que aparece depois que a pessoa começa a rolar
// e esconde perto do fim da página. Respeita "reduzir movimento".
import { useEffect, useState, startTransition } from "react"
import { motion, useReducedMotion } from "framer-motion"

interface Props {
    label?: string
    link?: string
    showAfter?: number
}

export default function FloatingDock({ label = "Vamos conversar", link = "mailto:annapaulacabralbr@gmail.com", showAfter = 600 }: Props) {
    const reduce = useReducedMotion()
    const [show, setShow] = useState(false)

    useEffect(() => {
        const onScroll = () => {
            const y = window.scrollY
            const nearEnd = window.innerHeight + y > document.documentElement.scrollHeight - 320
            startTransition(() => setShow(y > showAfter && !nearEnd))
        }
        onScroll()
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => window.removeEventListener("scroll", onScroll)
    }, [showAfter])

    return (
        <div style={{ position: "fixed", left: 0, right: 0, bottom: "calc(24px + env(safe-area-inset-bottom, 0px))", display: "flex", justifyContent: "center", pointerEvents: "none", zIndex: 50 }}>
            <motion.a
                href={link}
                aria-hidden={!show}
                tabIndex={show ? 0 : -1}
                initial={false}
                animate={{ y: show ? 0 : 90, opacity: show ? 1 : 0 }}
                transition={reduce ? { duration: 0 } : { duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
                whileHover={reduce ? undefined : { scale: 1.04 }}
                style={{
                    pointerEvents: show ? "auto" : "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "14px 22px",
                    minHeight: 48,
                    boxSizing: "border-box",
                    borderRadius: 999,
                    background: "#15140F",
                    color: "#FAFAF7",
                    boxShadow: "0 0 0 5px rgba(250,250,247,0.9), 0 18px 40px -12px rgba(21,20,15,0.45)",
                    fontFamily: "'Inter Tight', 'Inter', system-ui, sans-serif",
                    fontWeight: 500,
                    fontSize: 15,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                }}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
                </svg>
                {label}
            </motion.a>
        </div>
    )
}
