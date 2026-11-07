// Protótipo vivo do app, no mesmo formato do protótipo do Uber: celular à esquerda,
// jornadas em abas, título e explicação de cada tela e etapas numeradas à direita.
// O celular navega sozinho como se alguém usasse: um dedo toca no botão ou na aba, ou
// desliza a tela, e a próxima tela entra com a transição do gesto. Tocar ou arrastar a
// tela também navega. Botão de pausa (WCAG 2.2.2). Com "reduzir movimento", nada anda
// sozinho e as telas trocam sem animação.
import { useState, useRef, useEffect, startTransition, type CSSProperties } from "react"

export type Gesture = { type: "tap"; x: number; y: number } | { type: "swipe-left" } | { type: "swipe-up" } | { type: "none" }
export interface Step {
    src: string
    title: string
    note: string
    next?: Gesture // gesto que leva desta tela para a próxima
}
export interface Flow {
    label: string
    intro: string
    steps: Step[]
}
interface Labels {
    back: string
    next: string
    pause: string
    play: string
    flows: string
    steps: string
    step: string
    tapHint: string
}
const PT: Labels = { back: "← Voltar", next: "Próximo →", pause: "Pausar", play: "Reproduzir", flows: "Jornadas", steps: "Etapas da jornada", step: "Etapa", tapHint: "Toque para avançar" }

const FONT = "'Inter Tight', 'Inter', system-ui, sans-serif"
const INK = "#15140F"
const PAPER = "#FAFAF7"
const MUTED = "rgba(250,250,247,0.6)"
const EASE = "cubic-bezier(.22,.61,.36,1)"
const HOLD = 2600 // tempo parado em cada tela antes do gesto
const GESTURE = 800 // duração do gesto do dedo

type Enter = "fade" | "left" | "right" | "up" | "tap"

const CSS = `
@keyframes sn-left{from{transform:translateX(100%)}to{transform:none}}
@keyframes sn-right{from{transform:translateX(-100%)}to{transform:none}}
@keyframes sn-up{from{transform:translateY(100%)}to{transform:none}}
@keyframes sn-tap{from{opacity:0;transform:scale(1.04)}to{opacity:1;transform:none}}
@keyframes sn-fade{from{opacity:0}to{opacity:1}}
@keyframes sn-out-left{to{transform:translateX(-28%);filter:brightness(.55)}}
@keyframes sn-out-right{to{transform:translateX(28%);filter:brightness(.55)}}
@keyframes sn-out-up{to{transform:translateY(-22%);filter:brightness(.55)}}
@keyframes sn-text{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@keyframes sn-finger-tap{0%{opacity:0;transform:translate(-50%,-50%) scale(1.5)}35%{opacity:1;transform:translate(-50%,-50%) scale(1)}55%{transform:translate(-50%,-50%) scale(.78)}75%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) scale(1)}}
@keyframes sn-ripple{0%,50%{opacity:0;transform:translate(-50%,-50%) scale(.4)}60%{opacity:.7}100%{opacity:0;transform:translate(-50%,-50%) scale(2.4)}}
@keyframes sn-finger-left{0%{opacity:0;left:82%}20%{opacity:1;left:80%}85%{opacity:1;left:22%}100%{opacity:0;left:18%}}
@keyframes sn-finger-up{0%{opacity:0;top:76%}20%{opacity:1;top:74%}85%{opacity:1;top:34%}100%{opacity:0;top:30%}}
`

export default function ScreenNavigator({ flows, labels = PT }: { flows: Flow[]; labels?: Labels }) {
    const [f, setF] = useState(0)
    const [s, setS] = useState(0)
    const [prev, setPrev] = useState<string | null>(null)
    const [enter, setEnter] = useState<Enter>("fade")
    const [finger, setFinger] = useState<Gesture | null>(null)
    const [wide, setWide] = useState(true)
    const [reduce, setReduce] = useState(false)
    const [playing, setPlaying] = useState(true)
    const [visible, setVisible] = useState(false)
    const root = useRef<HTMLDivElement>(null)
    const startX = useRef<number | null>(null)

    const flow = flows[f]
    const step = flow.steps[s]
    const total = flows.reduce((a, x) => a + x.steps.length, 0)
    const globalIndex = flows.slice(0, f).reduce((a, x) => a + x.steps.length, 0) + s

    const go = (nf: number, ns: number, how: Enter) =>
        startTransition(() => {
            setPrev(step.src)
            setEnter(how)
            setF(nf)
            setS(ns)
        })
    const next = (how: Enter = "left") => {
        if (s < flow.steps.length - 1) go(f, s + 1, how)
        else go((f + 1) % flows.length, 0, "fade")
    }
    const back = () => {
        if (s > 0) go(f, s - 1, "right")
        else {
            const pf = (f - 1 + flows.length) % flows.length
            go(pf, flows[pf].steps.length - 1, "fade")
        }
    }
    const user = (fn: () => void) => {
        startTransition(() => {
            setPlaying(false)
            setFinger(null)
        })
        fn()
    }

    useEffect(() => {
        const m = () => root.current && setWide(root.current.offsetWidth >= 760)
        m()
        const ro = new ResizeObserver(m)
        if (root.current) ro.observe(root.current)
        const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 })
        if (root.current) io.observe(root.current)
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
        setReduce(mq.matches)
        if (mq.matches) setPlaying(false)
        return () => {
            ro.disconnect()
            io.disconnect()
        }
    }, [])

    // demonstração automática: espera, mostra o gesto e troca a tela
    useEffect(() => {
        if (!playing || !visible || reduce) return
        const g: Gesture = step.next ?? { type: "none" }
        const t1 = window.setTimeout(() => setFinger(g), HOLD)
        const t2 = window.setTimeout(
            () => {
                setFinger(null)
                next(g.type === "swipe-left" ? "left" : g.type === "swipe-up" ? "up" : g.type === "tap" ? "tap" : "fade")
            },
            HOLD + (g.type === "none" ? 0 : GESTURE),
        )
        return () => {
            window.clearTimeout(t1)
            window.clearTimeout(t2)
        }
    }, [f, s, playing, visible, reduce])

    // pré-carrega a próxima tela
    useEffect(() => {
        const n = s < flow.steps.length - 1 ? flow.steps[s + 1] : flows[(f + 1) % flows.length].steps[0]
        const img = new Image()
        img.src = n.src
    }, [f, s])

    const dur = enter === "tap" || enter === "fade" ? ".4s" : ".5s"
    const inAnim = reduce ? "none" : `sn-${enter} ${dur} ${EASE} both`
    const outAnim = reduce || enter === "tap" || enter === "fade" ? "none" : `sn-out-${enter} ${dur} ${EASE} both`
    const layer: CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block", userSelect: "none" }
    const dot: CSSProperties = { position: "absolute", width: 46, height: 46, borderRadius: "50%", background: "rgba(250,250,247,.4)", border: "2px solid rgba(250,250,247,.92)", boxShadow: "0 6px 18px rgba(0,0,0,.4)", pointerEvents: "none", zIndex: 3 }
    const pill: CSSProperties = { fontFamily: FONT, fontSize: 15, fontWeight: 500, padding: "12px 20px", minHeight: 44, borderRadius: 999, border: `1px solid ${PAPER}`, background: "transparent", color: PAPER, cursor: "pointer", transition: "background .45s cubic-bezier(.33,1,.68,1), color .45s cubic-bezier(.33,1,.68,1)" }

    const phone = (
        <div style={{ width: wide ? 340 : "100%", maxWidth: 340, flex: "none", display: "flex", flexDirection: "column", gap: 18, margin: wide ? 0 : "0 auto" }}>
            <div style={{ borderRadius: 42, padding: 9, background: "#000", boxShadow: "0 0 0 1px rgba(250,250,247,0.12), 0 50px 90px -40px rgba(0,0,0,0.7)" }}>
                <div
                    role="button"
                    tabIndex={0}
                    aria-label={`${step.title}. ${labels.tapHint}`}
                    onPointerDown={(e) => (startX.current = e.clientX)}
                    onPointerUp={(e) => {
                        if (startX.current === null) return
                        const dx = e.clientX - startX.current
                        startX.current = null
                        if (dx > 40) user(back)
                        else user(() => next(dx < -40 ? "left" : "tap"))
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            user(() => next("tap"))
                        }
                    }}
                    style={{ position: "relative", width: "100%", aspectRatio: "780 / 1688", overflow: "hidden", borderRadius: 34, background: "#0A0A0B", cursor: "pointer", touchAction: "pan-y", outlineOffset: 4 }}
                >
                    {prev && prev !== step.src && <img key={`p-${prev}-${f}-${s}`} src={prev} alt="" aria-hidden="true" draggable={false} style={{ ...layer, animation: outAnim }} />}
                    <img key={`c-${f}-${s}`} src={step.src} alt="" draggable={false} style={{ ...layer, animation: inAnim, zIndex: 1 }} />
                    {finger?.type === "tap" && (
                        <>
                            <span style={{ ...dot, left: `${finger.x}%`, top: `${finger.y}%`, animation: `sn-finger-tap ${GESTURE}ms ease both` }} />
                            <span style={{ ...dot, background: "transparent", left: `${finger.x}%`, top: `${finger.y}%`, animation: `sn-ripple ${GESTURE}ms ease-out both` }} />
                        </>
                    )}
                    {finger?.type === "swipe-left" && <span style={{ ...dot, top: "50%", transform: "translate(-50%,-50%)", animation: `sn-finger-left ${GESTURE}ms ${EASE} both` }} />}
                    {finger?.type === "swipe-up" && <span style={{ ...dot, left: "50%", transform: "translate(-50%,-50%)", animation: `sn-finger-up ${GESTURE}ms ${EASE} both` }} />}
                </div>
            </div>
            <div style={{ height: 2, background: "rgba(250,250,247,0.15)", position: "relative", overflow: "hidden", borderRadius: 2 }} aria-hidden="true">
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${((globalIndex + 1) / total) * 100}%`, background: PAPER, transition: reduce ? "none" : `width .5s ${EASE}` }} />
            </div>
        </div>
    )

    const panel = (
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 36, fontFamily: FONT }}>
            <div role="tablist" aria-label={labels.flows} style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {flows.map((x, i) => (
                    <button
                        key={x.label}
                        type="button"
                        role="tab"
                        aria-selected={i === f}
                        onClick={() => user(() => go(i, 0, "fade"))}
                        style={{ ...pill, background: i === f ? PAPER : "transparent", color: i === f ? INK : PAPER, borderColor: i === f ? PAPER : "rgba(250,250,247,0.3)" }}
                    >
                        {x.label}
                    </button>
                ))}
            </div>
            <div aria-live="polite" style={{ display: "flex", flexDirection: "column", gap: 16, minHeight: 230 }}>
                <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: MUTED }}>
                    {String(s + 1).padStart(2, "0")} / {String(flow.steps.length).padStart(2, "0")} · {flow.intro}
                </div>
                <div key={`t-${f}-${s}`} style={{ display: "flex", flexDirection: "column", gap: 16, animation: reduce ? "none" : `sn-text .45s ${EASE} both` }}>
                    <h3 style={{ margin: 0, fontWeight: 700, fontSize: wide ? 46 : 32, lineHeight: 1.05, color: PAPER, letterSpacing: "-0.04em" }}>{step.title}</h3>
                    <p style={{ margin: 0, fontSize: 19, lineHeight: 1.55, color: "rgba(250,250,247,0.82)", maxWidth: 540 }}>{step.note}</p>
                </div>
            </div>
            <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: 6 }} aria-label={labels.steps}>
                {flow.steps.map((x, i) => (
                    <li key={i}>
                        <button
                            type="button"
                            onClick={() => user(() => go(f, i, i > s ? "left" : "right"))}
                            aria-current={i === s ? "step" : undefined}
                            aria-label={`${labels.step} ${i + 1}: ${x.title}`}
                            title={x.title}
                            style={{ width: 40, height: 40, borderRadius: "50%", fontFamily: FONT, fontSize: 13, fontWeight: 500, border: `1px solid ${i === s ? PAPER : "rgba(250,250,247,0.3)"}`, background: i === s ? PAPER : "transparent", color: i === s ? INK : PAPER, cursor: "pointer", transition: "background .35s, color .35s" }}
                        >
                            {i + 1}
                        </button>
                    </li>
                ))}
            </ol>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                <button type="button" style={pill} onClick={() => user(back)}>
                    {labels.back}
                </button>
                <button type="button" style={{ ...pill, background: PAPER, color: INK }} onClick={() => user(() => next())}>
                    {labels.next}
                </button>
                {!reduce && (
                    <button type="button" style={{ ...pill, border: "none", color: MUTED }} onClick={() => startTransition(() => setPlaying(!playing))} aria-pressed={!playing}>
                        {playing ? labels.pause : labels.play}
                    </button>
                )}
            </div>
        </div>
    )

    return (
        <div ref={root} style={{ width: "100%", display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 96 : 40, alignItems: wide ? "center" : "stretch" }}>
            <style>{CSS}</style>
            {phone}
            {panel}
        </div>
    )
}
