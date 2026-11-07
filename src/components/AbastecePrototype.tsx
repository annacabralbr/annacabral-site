// Protótipo navegável da nova home do Abastece Aí (hoje KM de Vantagens): rolagem vertical,
// cards de saldo com "efeito gênio", carrosséis com deslize horizontal, menu rápido que abre
// o Menu completo e "Mostrar mais / menos" em Trocar Km. Peças exportadas do Figma.
// Tour automático; qualquer interação pausa. Respeita "reduzir movimento".
import { useEffect, useRef, useState, startTransition, type CSSProperties, type ReactNode } from "react"
import { motion, AnimatePresence, useMotionValue, animate, useInView, useReducedMotion, type MotionValue } from "framer-motion"

const U = (id: string) => `/img/${id}.png`
const IMG = {
    base: U("DnRfhXhVdwcfkpywNJzxEKhbGY"),
    stories: U("bq7eGbFQ5tfa8xB95UwE5KUKQY"),
    destaques: U("9TMz0H8T0T4JzN2QdrhTuqJrwk8"),
    produtos: U("ZzAmawneFeprMDf7OGtxPdAxCY"),
    ganhar: U("HT0MrHgfsaR6SyRDqmHUxnT2Z6Y"),
    card1: U("r15al69uxiI2YPe4cjCDgIDTO3U"),
    card2: U("b91xlMeJtSuyFS7aBmv3QsxoiI"),
    menu: U("OGO3HbHTHegJLKdzz4zXG5PvVzM"),
    mais: U("HYaJJSiTbCBsCFgpP036SKI"),
}

const W = 320
const H = 693
const TOP = 104
const TAB_Y = 3152
const TAB_H = 85
const CUT_A = 1952
const CUT_B = 2316
const COLLAPSE = CUT_B - CUT_A
const CARD_STEP = 223
const CARDS = [
    { src: IMG.card1, w: 206, h: 101, top: 5 },
    { src: IMG.card2, w: 207, h: 92, top: 9 },
]

type Row = { key: string; img: string; left: number; top: number; w: number; h: number; slice: "A" | "C" }
const ROWS: Row[] = [
    { key: "stories", img: IMG.stories, left: 25, top: 128, w: 608, h: 83, slice: "A" },
    { key: "destaques", img: IMG.destaques, left: 24, top: 1035, w: 1252, h: 101, slice: "A" },
    { key: "produtos", img: IMG.produtos, left: 16, top: 1301, w: 974, h: 181, slice: "A" },
    { key: "ganhar", img: IMG.ganhar, left: 8, top: 2453, w: 1112, h: 170, slice: "C" },
]

type Step = { key: string; title: string; note: string; tag?: string }
const STEPS: Step[] = [
    { key: "saldo", tag: "Deslize horizontal", title: "Saldo com efeito gênio", note: "Pontos, saldo e, no futuro, outros produtos lado a lado. O card em foco fica maior que os demais, como no efeito gênio da Apple." },
    { key: "menu", tag: "Toque", title: "Menu rápido e Mais opções", note: "Seis atalhos principais na home e uma pílula que abre o Menu completo, dividido em áreas: abastece-aí, conta e produtos." },
    { key: "carrosseis", tag: "Deslize horizontal", title: "Destaques e produtos em carrossel", note: "Destaques, produtos e serviços e Ganhar Km rolam na horizontal, sem alongar a home." },
    { key: "trocar", tag: "Expandir e recolher", title: "Trocar Km: mostrar mais ou menos", note: "Mostrar menos recolhe as categorias para a área de deslize ficar menor. Mostrar mais traz de volta, e o botão leva à lista completa." },
    { key: "duvidas", title: "Dúvidas no fim da home", note: "O que são, como acumular, trocar e ganhar cashback com Pontos Km, para quem chega sem conhecer o programa." },
]
const SCROLL_TO: Record<string, number> = { saldo: 140, menu: 330, carrosseis: 950, trocar: 1480, duvidas: 2560 }

const FONT = "'Inter Tight', 'Inter', system-ui, sans-serif"
const EASE = [0.22, 0.61, 0.36, 1] as const
const INK = "#15140F"
const PAPER = "#FAFAF7"
const ACCENT = "#C8F31D"

function Slice({ from, height, children }: { from: number; height: number | MotionValue<number>; children?: ReactNode }) {
    return (
        <motion.div style={{ position: "relative", width: W, height, overflow: "hidden", flex: "none" }}>
            <img src={IMG.base} alt="" draggable={false} style={{ position: "absolute", left: 0, top: -from, width: W, height: "auto", maxWidth: "none", display: "block", userSelect: "none", pointerEvents: "none" }} />
            {children}
        </motion.div>
    )
}

function Hotspot({ x, y, w, h, onTap, label, pulse }: { x: number; y: number; w: number; h: number; onTap: () => void; label: string; pulse: boolean }) {
    return (
        <button type="button" aria-label={label} onClick={onTap} style={{ position: "absolute", left: x, top: y, width: w, height: h, background: "transparent", border: "none", padding: 0, cursor: "pointer", borderRadius: 999, zIndex: 4 }}>
            {pulse && (
                <motion.span
                    aria-hidden="true"
                    animate={{ scale: [1, 1.25], opacity: [0.6, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
                    style={{ position: "absolute", inset: -4, borderRadius: 999, border: `3px solid ${ACCENT}`, pointerEvents: "none" }}
                />
            )}
        </button>
    )
}

export default function AbastecePrototype() {
    const reduce = useReducedMotion()
    const animated = !reduce
    const rootRef = useRef<HTMLDivElement>(null)
    const scrollRef = useRef<HTMLDivElement>(null)
    const menuScrollRef = useRef<HTMLDivElement>(null)
    const inView = useInView(rootRef, { margin: "-15% 0px -15% 0px" })
    const [wide, setWide] = useState(true)
    const [fit, setFit] = useState(1)
    const [step, setStep] = useState(0)
    const [playing, setPlaying] = useState(true)
    const [menuOpen, setMenuOpen] = useState(false)
    const [collapsed, setCollapsed] = useState(false)
    const [card, setCard] = useState(0)
    const bH = useMotionValue(COLLAPSE)
    const rowX: Record<string, MotionValue<number>> = {
        stories: useMotionValue(0),
        destaques: useMotionValue(0),
        produtos: useMotionValue(0),
        ganhar: useMotionValue(0),
    }
    const saldoX = useMotionValue(0)

    useEffect(() => {
        const m = () => {
            const r = rootRef.current
            if (!r) return
            const w = r.offsetWidth
            startTransition(() => {
                setWide(w >= 820)
                setFit(Math.min(1, (w >= 820 ? 340 : w) / 340))
            })
        }
        m()
        const ro = new ResizeObserver(m)
        if (rootRef.current) ro.observe(rootRef.current)
        return () => ro.disconnect()
    }, [])

    useEffect(() => {
        const c = animate(bH, collapsed ? 0 : COLLAPSE, animated ? { duration: 0.55, ease: EASE } : { duration: 0 })
        return () => c.stop()
    }, [collapsed])

    const goCard = (i: number) => {
        const n = Math.max(0, Math.min(CARDS.length - 1, i))
        startTransition(() => setCard(n))
        animate(saldoX, -n * CARD_STEP, animated ? { type: "spring", stiffness: 260, damping: 30 } : { duration: 0 })
    }
    const scrollTo = (y: number) => scrollRef.current?.scrollTo({ top: y, behavior: animated ? "smooth" : "auto" })
    const sweep = async (key: string) => {
        const r = ROWS.find((x) => x.key === key)!
        const min = -(r.left + r.w - W + 16)
        await animate(rowX[key], min, { duration: 1.6, ease: EASE })
        await new Promise((res) => setTimeout(res, 500))
        await animate(rowX[key], 0, { duration: 1.1, ease: EASE })
    }
    const pause = () => startTransition(() => setPlaying(false))

    const timers = useRef<number[]>([])
    const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms))
    const clearTimers = () => {
        timers.current.forEach((t) => window.clearTimeout(t))
        timers.current = []
    }
    const demo = (i: number) => {
        clearTimers()
        const k = STEPS[i].key
        if (k !== "menu") startTransition(() => setMenuOpen(false))
        scrollTo(SCROLL_TO[k])
        if (!animated) return
        if (k === "saldo") {
            later(() => goCard(1), 900)
            later(() => goCard(0), 2600)
        }
        if (k === "menu") {
            later(() => startTransition(() => setMenuOpen(true)), 1400)
            later(() => menuScrollRef.current?.scrollTo({ top: 260, behavior: "smooth" }), 2800)
            later(() => startTransition(() => setMenuOpen(false)), 4600)
        }
        if (k === "carrosseis") {
            later(() => sweep("destaques"), 900)
            later(() => sweep("produtos"), 4200)
        }
        if (k === "trocar") {
            later(() => startTransition(() => setCollapsed(true)), 1100)
            later(() => startTransition(() => setCollapsed(false)), 3400)
        }
    }

    const select = (i: number) => {
        pause()
        startTransition(() => setStep(i))
        demo(i)
    }

    useEffect(() => {
        if (!playing || !inView || !animated) return
        demo(step)
        const t = window.setTimeout(() => startTransition(() => setStep((s) => (s + 1) % STEPS.length)), 6400)
        return () => {
            window.clearTimeout(t)
            clearTimers()
        }
    }, [playing, inView, step])

    useEffect(() => () => clearTimers(), [])

    const rowEl = (r: Row, sliceTop: number) => (
        <div key={r.key} style={{ position: "absolute", left: 0, top: r.top - sliceTop, width: W, height: r.h, overflow: "hidden", touchAction: "pan-y" }}>
            <motion.img
                src={r.img}
                alt=""
                draggable={false}
                drag="x"
                dragConstraints={{ left: -(r.left + r.w - W + 16), right: 0 }}
                dragElastic={0.12}
                onDragStart={pause}
                style={{ position: "absolute", left: r.left, top: 0, width: r.w, height: r.h, maxWidth: "none", x: rowX[r.key], cursor: "grab", userSelect: "none" }}
            />
        </div>
    )

    const screen = (
        <div style={{ position: "relative", width: W, height: H, overflow: "hidden", borderRadius: 34, background: "#fff" }}>
            <style>{`.ab-scroll{scrollbar-width:none}.ab-scroll::-webkit-scrollbar{display:none}`}</style>
            <div ref={scrollRef} className="ab-scroll" onWheel={pause} onTouchStart={pause} style={{ position: "absolute", inset: 0, overflowY: "auto", overflowX: "hidden", overscrollBehavior: "contain" }}>
                <div style={{ display: "flex", flexDirection: "column", paddingBottom: TAB_H }}>
                    <Slice from={0} height={CUT_A}>
                        {ROWS.filter((r) => r.slice === "A").map((r) => rowEl(r, 0))}
                        <div style={{ position: "absolute", left: 0, top: 230, width: W, height: 112, overflow: "hidden", touchAction: "pan-y" }}>
                            <motion.div
                                drag="x"
                                dragConstraints={{ left: -CARD_STEP * (CARDS.length - 1), right: 0 }}
                                dragElastic={0.1}
                                onDragStart={pause}
                                onDragEnd={(_, info) => goCard(info.offset.x < -40 ? card + 1 : info.offset.x > 40 ? card - 1 : card)}
                                style={{ position: "absolute", left: 0, top: 0, width: W + CARD_STEP, height: 112, x: saldoX, cursor: "grab" }}
                            >
                                {CARDS.map((c, i) => (
                                    <motion.img
                                        key={i}
                                        src={c.src}
                                        alt=""
                                        draggable={false}
                                        animate={{ scale: card === i ? 1 : 0.9, opacity: card === i ? 1 : 0.75 }}
                                        transition={{ duration: 0.45, ease: EASE }}
                                        style={{ position: "absolute", left: 16 + i * CARD_STEP, top: c.top, width: c.w, height: c.h, transformOrigin: "left center", userSelect: "none", pointerEvents: "none" }}
                                    />
                                ))}
                            </motion.div>
                        </div>
                        <Hotspot
                            x={106}
                            y={600}
                            w={109}
                            h={36}
                            label="Mais opções: abrir o menu completo"
                            pulse={animated && step === 1 && !menuOpen}
                            onTap={() => {
                                pause()
                                startTransition(() => setMenuOpen(true))
                            }}
                        />
                        <AnimatePresence>
                            {collapsed && (
                                <motion.img
                                    key="mais"
                                    src={IMG.mais}
                                    alt=""
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    style={{ position: "absolute", left: 217, top: 1547, width: 79, height: 19, background: "#fff", pointerEvents: "none", zIndex: 3 }}
                                />
                            )}
                        </AnimatePresence>
                        <Hotspot
                            x={210}
                            y={1540}
                            w={92}
                            h={32}
                            label={collapsed ? "Mostrar mais categorias" : "Mostrar menos categorias"}
                            pulse={animated && step === 3}
                            onTap={() => {
                                pause()
                                startTransition(() => setCollapsed(!collapsed))
                            }}
                        />
                    </Slice>
                    <Slice from={CUT_A} height={bH} />
                    <Slice from={CUT_B} height={TAB_Y - CUT_B}>
                        {ROWS.filter((r) => r.slice === "C").map((r) => rowEl(r, CUT_B))}
                    </Slice>
                </div>
            </div>
            <div style={{ position: "absolute", left: 0, top: 0, width: W, height: TOP, overflow: "hidden", pointerEvents: "none" }}>
                <img src={IMG.base} alt="" style={{ position: "absolute", left: 0, top: 0, width: W, maxWidth: "none" }} />
            </div>
            <div style={{ position: "absolute", left: 0, bottom: 0, width: W, height: TAB_H, overflow: "hidden", pointerEvents: "none" }}>
                <img src={IMG.base} alt="" style={{ position: "absolute", left: 0, top: -TAB_Y, width: W, maxWidth: "none" }} />
            </div>
            <AnimatePresence>
                {menuOpen && (
                    <motion.div key="menu" initial={animated ? { x: W } : false} animate={{ x: 0 }} exit={animated ? { x: W } : undefined} transition={{ duration: 0.45, ease: EASE }} style={{ position: "absolute", inset: 0, background: "#fff", zIndex: 10 }}>
                        <div ref={menuScrollRef} className="ab-scroll" onWheel={pause} style={{ position: "absolute", inset: 0, overflowY: "auto" }}>
                            <div style={{ position: "relative", width: W, height: 852, overflow: "hidden" }}>
                                <img src={IMG.menu} alt="Menu completo do app, dividido em abastece-aí, conta e produtos" style={{ position: "absolute", left: -16, top: -12, width: 352, maxWidth: "none" }} />
                            </div>
                        </div>
                        <button
                            type="button"
                            aria-label="Voltar para a home"
                            onClick={() => {
                                pause()
                                startTransition(() => setMenuOpen(false))
                            }}
                            style={{ position: "absolute", left: 10, top: 6, width: 44, height: 44, background: "transparent", border: "none", cursor: "pointer" }}
                        />
                        <button
                            type="button"
                            aria-label="Fechar menu"
                            onClick={() => {
                                pause()
                                startTransition(() => setMenuOpen(false))
                            }}
                            style={{ position: "absolute", right: 10, top: 6, width: 44, height: 44, background: "transparent", border: "none", cursor: "pointer" }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )

    const phone = (
        <div style={{ width: 338 * fit, height: (H + 18) * fit, flex: "none", margin: wide ? 0 : "0 auto" }}>
            <div style={{ width: 338, transform: `scale(${fit})`, transformOrigin: "top left", borderRadius: 42, padding: 9, boxSizing: "border-box", background: "#000", boxShadow: "0 0 0 1px rgba(250,250,247,0.12), 0 50px 90px -40px rgba(0,0,0,0.7)" }}>{screen}</div>
        </div>
    )

    const pill: CSSProperties = { fontFamily: FONT, fontSize: 15, fontWeight: 500, padding: "12px 20px", minHeight: 44, borderRadius: 999, border: `1px solid ${PAPER}`, background: PAPER, color: INK, cursor: "pointer" }
    const cur = STEPS[step]

    const panel = (
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 32, fontFamily: FONT }}>
            <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(250,250,247,0.6)" }}>
                {String(step + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")} · role, deslize e toque no celular
            </div>
            <div aria-live="polite" style={{ minHeight: 210 }}>
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div key={step} initial={animated ? { y: 16, opacity: 0 } : false} animate={{ y: 0, opacity: 1 }} exit={animated ? { y: -10, opacity: 0 } : undefined} transition={{ duration: 0.45, ease: EASE }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {cur.tag && <span style={{ alignSelf: "flex-start", fontSize: 12, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: INK, background: ACCENT, borderRadius: 999, padding: "5px 12px" }}>{cur.tag}</span>}
                        <h3 style={{ margin: 0, fontWeight: 700, fontSize: wide ? 46 : 32, lineHeight: 1.05, color: PAPER, letterSpacing: "-0.04em" }}>{cur.title}</h3>
                        <p style={{ margin: 0, fontSize: 19, lineHeight: 1.55, color: "rgba(250,250,247,0.82)", maxWidth: 540 }}>{cur.note}</p>
                    </motion.div>
                </AnimatePresence>
            </div>
            <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", borderTop: "1px solid rgba(250,250,247,0.18)" }}>
                {STEPS.map((s, i) => (
                    <li key={s.key}>
                        <button
                            type="button"
                            aria-current={i === step ? "step" : undefined}
                            onClick={() => select(i)}
                            style={{ width: "100%", display: "flex", gap: 16, alignItems: "baseline", textAlign: "left", padding: "14px 0", background: "transparent", border: "none", borderBottom: "1px solid rgba(250,250,247,0.18)", cursor: "pointer", fontFamily: FONT, color: PAPER, opacity: i === step ? 1 : 0.55, transition: "opacity .35s" }}
                        >
                            <span style={{ fontSize: 13, width: 24 }}>{String(i + 1).padStart(2, "0")}</span>
                            <span style={{ fontSize: 18, fontWeight: 500 }}>{s.title}</span>
                        </button>
                    </li>
                ))}
            </ol>
            {animated && (
                <div style={{ display: "flex", gap: 10 }}>
                    <button type="button" style={pill} onClick={() => startTransition(() => setPlaying(!playing))} aria-pressed={playing}>
                        {playing ? "Pausar tour" : "Reproduzir tour"}
                    </button>
                </div>
            )}
        </div>
    )

    return (
        <div ref={rootRef} style={{ width: "100%", display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 96 : 40, alignItems: wide ? "center" : "stretch" }}>
            {phone}
            {panel}
        </div>
    )
}
