// Card de case: a tela do projeto rola sozinha dentro de um celular ou de uma janela.
// No hover: cursor grande circular com "Mostrar detalhes ↗", cantos arredondam e a
// mídia aproxima levemente. Sem animação com "reduzir movimento".
import { useRef, useState, useEffect, useId, startTransition, type CSSProperties, type ReactNode, type MouseEvent } from "react"
import { motion, useInView, useReducedMotion, useMotionValue, useSpring } from "framer-motion"

interface ScreenCardProps {
    index: string
    client: string
    title: string
    meta: string
    tags: string
    cta?: string
    src: string
    device: "desktop" | "mobile"
    link: string
    speed?: number
}

const FONT = "'Inter Tight', 'Inter', system-ui, sans-serif"
const EASE = [0.22, 0.61, 0.36, 1] as const
const CONTAINER = { containerType: "inline-size" } as unknown as CSSProperties
const INK = "#15140F"
const PAPER = "#FAFAF7"

export default function ScreenCard(props: ScreenCardProps) {
    const { index, client, title, meta, tags, cta = "Mostrar detalhes", src, device, link, speed = 60 } = props
    const reduce = useReducedMotion()
    const animate = !reduce
    const cls = "sc" + useId().replace(/[^a-zA-Z0-9]/g, "")
    const css = `@container (max-width: 520px){.${cls} .sc-dev{width:46% !important}.${cls} .sc-title{font-size:24px !important}.${cls} .sc-meta{font-size:14px !important}}`

    const cardRef = useRef<HTMLDivElement>(null)
    const viewRef = useRef<HTMLDivElement>(null)
    const imgRef = useRef<HTMLImageElement>(null)
    const inView = useInView(cardRef, { margin: "0px 0px -15% 0px" })
    const [travel, setTravel] = useState(0)
    const [hover, setHover] = useState(false)
    const [fine, setFine] = useState(false)

    const mx = useMotionValue(0)
    const my = useMotionValue(0)
    const sx = useSpring(mx, { stiffness: 260, damping: 26 })
    const sy = useSpring(my, { stiffness: 260, damping: 26 })

    const measure = () => {
        const v = viewRef.current
        const im = imgRef.current
        if (!v || !im) return
        startTransition(() => setTravel(Math.max(0, im.offsetHeight - v.offsetHeight)))
    }
    useEffect(() => {
        setFine(window.matchMedia("(hover: hover) and (pointer: fine)").matches)
        measure()
        window.addEventListener("resize", measure)
        const ro = viewRef.current ? new ResizeObserver(measure) : null
        if (ro && viewRef.current) ro.observe(viewRef.current)
        return () => {
            window.removeEventListener("resize", measure)
            ro?.disconnect()
        }
    }, [src])

    const duration = Math.max(5, travel / Math.max(10, speed))
    const scrolling = animate && inView && travel > 0
    const isMobile = device === "mobile"
    const label12: CSSProperties = { fontFamily: FONT, fontSize: 12, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: "#73716C" }
    const cursor = animate && fine

    const content: ReactNode = (
        <>
            <motion.div
                animate={{ borderRadius: hover && animate ? 28 : 4 }}
                transition={{ duration: 0.35, ease: EASE }}
                style={{ position: "relative", overflow: "hidden", background: "#EDEDEA", aspectRatio: "4 / 3", display: "flex", justifyContent: "center", alignItems: isMobile ? "center" : "flex-end" }}
            >
                <motion.div
                    className={isMobile ? "sc-dev" : undefined}
                    animate={{ scale: hover && animate ? 1.035 : 1 }}
                    transition={{ duration: 0.8, ease: EASE }}
                    style={{
                        width: isMobile ? "34%" : "84%",
                        marginTop: isMobile ? 0 : "8%",
                        borderRadius: isMobile ? 22 : "8px 8px 0 0",
                        background: "#fff",
                        overflow: "hidden",
                        boxShadow: "0 30px 60px -30px rgba(21,20,15,0.35)",
                        outline: isMobile ? `6px solid ${INK}` : "none",
                        transformOrigin: "center bottom",
                    }}
                >
                    <div ref={viewRef} style={{ position: "relative", width: "100%", aspectRatio: isMobile ? "9 / 19" : "16 / 10", overflow: "hidden", background: "#fff" }}>
                        <motion.img
                            ref={imgRef}
                            src={src}
                            alt={`Tela do projeto ${title}`}
                            loading="lazy"
                            decoding="async"
                            onLoad={measure}
                            draggable={false}
                            style={{ display: "block", width: "100%", height: "auto", position: "absolute", top: 0, left: 0 }}
                            animate={scrolling ? { y: [0, -travel, -travel, 0, 0] } : { y: 0 }}
                            transition={scrolling ? { duration: duration * 2 + 3, times: [0, 0.45, 0.55, 0.95, 1], ease: "easeInOut", repeat: Infinity } : { duration: 0.6 }}
                        />
                    </div>
                </motion.div>
            </motion.div>

            <div style={{ padding: "22px 2px 0 2px", display: "flex", flexDirection: "column", gap: 10 }}>
                <span style={label12}>
                    {index} · {client}
                </span>
                <span className="sc-title" style={{ fontFamily: FONT, fontWeight: 700, fontSize: 30, lineHeight: 1.1, letterSpacing: "-0.03em", color: INK }}>
                    {title}
                </span>
                <span className="sc-meta" style={{ fontFamily: FONT, fontSize: 15, color: "#73716C" }}>
                    {meta} — {tags}
                </span>
                <span style={{ fontFamily: FONT, fontSize: 15, fontWeight: 500, color: INK, display: "inline-flex", gap: 8, marginTop: 4 }}>
                    <span style={{ backgroundImage: `linear-gradient(${INK},${INK})`, backgroundRepeat: "no-repeat", backgroundPosition: "0 100%", backgroundSize: hover ? "100% 1px" : "0% 1px", transition: "background-size .45s cubic-bezier(.33,1,.68,1)" }}>{cta}</span>
                    <motion.span aria-hidden="true" animate={{ x: hover ? 4 : 0 }} transition={{ duration: 0.3 }}>
                        →
                    </motion.span>
                </span>
            </div>

            {cursor && (
                <motion.span
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        x: sx,
                        y: sy,
                        translateX: "-50%",
                        translateY: "-50%",
                        width: 128,
                        height: 128,
                        borderRadius: "50%",
                        background: INK,
                        color: PAPER,
                        display: "grid",
                        placeItems: "center",
                        textAlign: "center",
                        padding: 18,
                        boxSizing: "border-box",
                        fontFamily: FONT,
                        fontSize: 14,
                        fontWeight: 500,
                        lineHeight: 1.25,
                        pointerEvents: "none",
                        zIndex: 5,
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: hover ? 1 : 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                >
                    {cta} ↗
                </motion.span>
            )}
        </>
    )

    return (
        <motion.div
            ref={cardRef}
            className={cls}
            style={{ position: "relative", width: "100%", ...CONTAINER }}
        >
            <style>{css}</style>
            <a
                href={link}
                aria-label={`${client}: ${title}. ${cta}`}
                onMouseEnter={() => startTransition(() => setHover(true))}
                onMouseLeave={() => startTransition(() => setHover(false))}
                onFocus={() => startTransition(() => setHover(true))}
                onBlur={() => startTransition(() => setHover(false))}
                onMouseMove={(e: MouseEvent<HTMLAnchorElement>) => {
                    const r = e.currentTarget.getBoundingClientRect()
                    mx.set(e.clientX - r.left)
                    my.set(e.clientY - r.top)
                }}
                style={{ display: "block", position: "relative", textDecoration: "none", color: INK, cursor: cursor ? "none" : "pointer" }}
            >
                {content}
            </a>
        </motion.div>
    )
}
