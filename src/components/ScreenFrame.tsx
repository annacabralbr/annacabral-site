// Moldura discreta (celular ou janela) em que a tela do projeto rola sozinha quando
// está visível. Aceita vídeo (toca mudo em loop só quando visível). Desfoque opcional
// para telas com informação confidencial, com selo explicando. Respeita "reduzir movimento".
import { useRef, useState, useEffect, startTransition, type CSSProperties } from "react"
import { motion, useInView, useReducedMotion } from "framer-motion"

interface ScreenFrameProps {
    src?: string
    video?: string
    alt?: string
    caption?: string
    device?: "desktop" | "mobile"
    scroll?: boolean
    speed?: number
    blur?: number
    blurLabel?: string
}

const FONT = "'Inter Tight', 'Inter', system-ui, sans-serif"
const SLOW = 1.35
const INK = "#15140F"

export default function ScreenFrame(props: ScreenFrameProps) {
    const { src = "", video = "", alt = "Tela do projeto", caption = "", device = "mobile", scroll = true, speed = 70, blur = 0, blurLabel = "Detalhes sob NDA · apresento em conversa" } = props
    const reduce = useReducedMotion()
    const ref = useRef<HTMLElement>(null)
    const viewRef = useRef<HTMLDivElement>(null)
    const imgRef = useRef<HTMLImageElement>(null)
    const vidRef = useRef<HTMLVideoElement>(null)
    const inView = useInView(ref, { margin: "0px 0px -10% 0px" })
    const [travel, setTravel] = useState(0)
    const isMobile = device === "mobile"
    const hasVideo = !!video
    const blurred = blur > 0
    const ratio = isMobile ? (hasVideo ? "9 / 19.5" : "9 / 19") : "16 / 10"

    const measure = () => {
        const v = viewRef.current
        const im = imgRef.current
        if (!v || !im || !im.naturalWidth) return
        const scale = v.offsetWidth / im.naturalWidth
        startTransition(() => setTravel(Math.max(0, im.naturalHeight * scale - v.offsetHeight)))
    }
    useEffect(() => {
        if (hasVideo) return
        measure()
        window.addEventListener("resize", measure)
        return () => window.removeEventListener("resize", measure)
    }, [src, hasVideo])

    useEffect(() => {
        const el = vidRef.current
        if (!el) return
        if (inView && !reduce && !blurred) el.play().catch(() => {})
        else el.pause()
    }, [inView, reduce, video, blurred])

    const run = scroll && !blurred && !reduce && inView && travel > 0
    const d = Math.max(6, (travel / Math.max(10, speed)) * SLOW)
    const blurStyle: CSSProperties = blurred ? { filter: `blur(${blur}px)`, transform: "scale(1.06)" } : {}

    return (
        <motion.figure
            ref={ref}
            initial={!reduce ? { y: 40, opacity: 0 } : false}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
            style={{ position: "relative", width: "100%", margin: 0, display: "flex", flexDirection: "column", gap: 14 }}
        >
            <div style={{ borderRadius: isMobile ? 34 : 10, background: isMobile ? INK : "#fff", padding: isMobile ? 7 : 0, overflow: "hidden", boxShadow: "0 40px 80px -40px rgba(21,20,15,0.4), 0 0 0 1px rgba(21,20,15,0.06)" }}>
                {!isMobile && (
                    <div style={{ display: "flex", gap: 6, padding: "10px 12px", background: "#F2F1EE" }} aria-hidden="true">
                        {[0, 1, 2].map((k) => (
                            <span key={k} style={{ width: 9, height: 9, borderRadius: "50%", background: "#D6D4CE" }} />
                        ))}
                    </div>
                )}
                <div ref={viewRef} style={{ position: "relative", width: "100%", aspectRatio: ratio, overflow: "hidden", background: "#fff", borderRadius: isMobile ? 27 : 0 }}>
                    <div style={{ position: "absolute", inset: 0, ...blurStyle }} aria-hidden={blurred ? true : undefined}>
                        {hasVideo ? (
                            <video
                                ref={vidRef}
                                src={video}
                                aria-label={blurred ? undefined : alt}
                                muted
                                loop
                                playsInline
                                preload="metadata"
                                controls={!!reduce && !blurred}
                                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }}
                            />
                        ) : src ? (
                            <motion.img
                                ref={imgRef}
                                src={src}
                                alt={blurred ? "" : alt}
                                loading="lazy"
                                decoding="async"
                                onLoad={measure}
                                draggable={false}
                                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "auto", display: "block" }}
                                animate={run ? { y: [0, -travel, -travel, 0, 0] } : { y: 0 }}
                                transition={run ? { duration: d * 2 + 3, times: [0, 0.45, 0.55, 0.95, 1], ease: "easeInOut", repeat: Infinity } : { duration: 0.5 }}
                            />
                        ) : null}
                    </div>
                    {blurred && (
                        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", padding: 16, background: "rgba(250,250,247,0.25)" }}>
                            <span role="note" style={{ fontFamily: FONT, fontSize: 13, fontWeight: 500, lineHeight: 1.35, textAlign: "center", color: "#FAFAF7", background: INK, borderRadius: 999, padding: "10px 16px", maxWidth: "90%" }}>
                                {blurLabel}
                            </span>
                        </div>
                    )}
                </div>
            </div>
            {caption && <figcaption style={{ fontFamily: FONT, fontSize: 12, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: "#73716C" }}>{caption}</figcaption>}
        </motion.figure>
    )
}
