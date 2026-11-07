// Navegador de telas: um celular mostra uma tela por vez e a lista ao lado (ou abaixo,
// no celular) leva direto a cada etapa, agrupada por jornada. Setas, teclado (← →) e
// arrastar na tela também navegam. Sem transição com "reduzir movimento".
import { useState, useRef, useEffect, startTransition, type CSSProperties } from "react"

interface Screen {
    src: string
    caption: string
}
interface Journey {
    title: string
    screens: Screen[]
}
interface Props {
    journeys: Journey[]
    prevLabel?: string
    nextLabel?: string
    ofLabel?: string
}

const FONT = "'Inter Tight', 'Inter', system-ui, sans-serif"
const INK = "#15140F"
const MUTED = "#73716C"
const LINE = "#DAD9D4"

export default function ScreenNavigator({ journeys, prevLabel = "Tela anterior", nextLabel = "Próxima tela", ofLabel = "de" }: Props) {
    const flat = journeys.flatMap((j, ji) => j.screens.map((s) => ({ ...s, journey: ji })))
    const [i, setI] = useState(0)
    const [wide, setWide] = useState(true)
    const [reduce, setReduce] = useState(false)
    const root = useRef<HTMLDivElement>(null)
    const listRef = useRef<HTMLDivElement>(null)
    const startX = useRef<number | null>(null)
    const total = flat.length
    const go = (n: number) => startTransition(() => setI(((n % total) + total) % total))

    useEffect(() => {
        const m = () => root.current && setWide(root.current.offsetWidth >= 760)
        m()
        const ro = new ResizeObserver(m)
        if (root.current) ro.observe(root.current)
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
        setReduce(mq.matches)
        return () => ro.disconnect()
    }, [])

    // no celular, mantém a etapa atual visível na faixa rolável
    useEffect(() => {
        if (wide || !listRef.current) return
        const el = listRef.current.querySelector<HTMLElement>(`[data-i="${i}"]`)
        if (el) listRef.current.scrollTo({ left: el.offsetLeft - 20, behavior: reduce ? "auto" : "smooth" })
    }, [i, wide, reduce])

    // pré-carrega a próxima tela
    useEffect(() => {
        const img = new Image()
        img.src = flat[(i + 1) % total].src
    }, [i])

    const cur = flat[i]
    const arrow: CSSProperties = { width: 48, height: 48, borderRadius: 999, border: `1px solid ${INK}`, background: "transparent", color: INK, display: "grid", placeItems: "center", cursor: "pointer", flex: "none" }

    const phone = (
        <div
            style={{ width: wide ? 300 : "min(300px, 100%)", flex: "none", touchAction: "pan-y" }}
            onPointerDown={(e) => (startX.current = e.clientX)}
            onPointerUp={(e) => {
                if (startX.current === null) return
                const dx = e.clientX - startX.current
                startX.current = null
                if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1))
            }}
        >
            <div style={{ borderRadius: 34, background: INK, padding: 7, boxShadow: "0 40px 80px -40px rgba(21,20,15,0.4), 0 0 0 1px rgba(21,20,15,0.06)" }}>
                <div style={{ position: "relative", aspectRatio: "780 / 1688", borderRadius: 27, overflow: "hidden", background: "#0A0A0B" }}>
                    {flat.map((s, k) => (
                        <img
                            key={s.src}
                            src={s.src}
                            alt={k === i ? s.caption : ""}
                            aria-hidden={k === i ? undefined : true}
                            loading={k < 2 ? "eager" : "lazy"}
                            decoding="async"
                            draggable={false}
                            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", opacity: k === i ? 1 : 0, transition: reduce ? "none" : "opacity .35s ease" }}
                        />
                    ))}
                </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 20 }}>
                <button type="button" aria-label={prevLabel} onClick={() => go(i - 1)} style={arrow}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
                </button>
                <p aria-live="polite" style={{ margin: 0, fontFamily: FONT, fontSize: 13, lineHeight: 1.35, color: INK, textAlign: "center", fontWeight: 500 }}>
                    <span style={{ color: MUTED, fontWeight: 400 }}>{String(i + 1).padStart(2, "0")} {ofLabel} {total} · </span>
                    {cur.caption}
                </p>
                <button type="button" aria-label={nextLabel} onClick={() => go(i + 1)} style={arrow}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
        </div>
    )

    const item = (s: (typeof flat)[number], k: number) => {
        const on = k === i
        return (
            <button
                key={k}
                type="button"
                data-i={k}
                aria-current={on ? "step" : undefined}
                onClick={() => go(k)}
                style={
                    wide
                        ? { display: "flex", gap: 12, alignItems: "baseline", width: "100%", minHeight: 44, padding: "10px 0", background: "transparent", border: "none", borderTop: `1px solid ${LINE}`, textAlign: "left", cursor: "pointer", fontFamily: FONT, fontSize: 15, lineHeight: 1.35, color: on ? INK : MUTED, fontWeight: on ? 600 : 400 }
                        : { flex: "none", minHeight: 44, padding: "0 16px", borderRadius: 999, border: `1px solid ${on ? INK : LINE}`, background: on ? INK : "transparent", color: on ? "#FAFAF7" : INK, fontFamily: FONT, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap" }
                }
            >
                {wide && <span style={{ fontSize: 12, letterSpacing: "0.08em", width: 22, flex: "none" }}>{String(k + 1).padStart(2, "0")}</span>}
                <span>{s.caption}</span>
            </button>
        )
    }

    let k = -1
    return (
        <div
            ref={root}
            role="group"
            tabIndex={-1}
            onKeyDown={(e) => {
                if (e.key === "ArrowRight") go(i + 1)
                if (e.key === "ArrowLeft") go(i - 1)
            }}
            style={{ width: "100%", display: "flex", flexDirection: wide ? "row" : "column", alignItems: wide ? "flex-start" : "center", gap: wide ? 72 : 28 }}
        >
            {phone}
            {wide ? (
                <div style={{ flex: 1, minWidth: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0 40px" }}>
                    {journeys.map((j, ji) => (
                        <div key={ji}>
                            <p style={{ margin: "0 0 12px", fontFamily: FONT, fontSize: 12, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: MUTED }}>{j.title}</p>
                            <div style={{ borderBottom: `1px solid ${LINE}` }}>{j.screens.map(() => (k++, item(flat[k], k)))}</div>
                        </div>
                    ))}
                </div>
            ) : (
                <div ref={listRef} style={{ width: "100vw", marginInline: "calc(50% - 50vw)", display: "flex", gap: 8, overflowX: "auto", padding: "0 20px 8px", scrollbarWidth: "none" }}>
                    {flat.map((s, kk) => item(s, kk))}
                </div>
            )}
        </div>
    )
}
