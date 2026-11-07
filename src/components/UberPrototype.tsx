// Protótipo navegável do case Uber da Smiles: 4 fluxos (Comprar, Resgatar, Meu Uber,
// Uber Pass). A tela rola até o ponto de toque, pulsa e avança sozinha. Toque na tela,
// use as setas ou clique numa etapa para navegar. Respeita "reduzir movimento".
import { useEffect, useRef, useState, startTransition, type CSSProperties } from "react"
import { motion, AnimatePresence, useInView, useReducedMotion } from "framer-motion"

type Step = {
    img: string
    w: number
    h: number
    crop?: [number, number, number, number]
    hot?: [number, number]
    tag?: string
    title: string
    note: string
}
type Flow = { label: string; intro: string; steps: Step[] }

const U = (id: string) => `/img/${id}.png`
const CROP: [number, number, number, number] = [48, 48, 0, 48]

const FLOWS: Flow[] = [
    {
        label: "Comprar",
        intro: "Compra de créditos com dinheiro, acumulando milhas.",
        steps: [
            { img: U("UfSPSiuMsnnQ5FxcHAvFRFEE04"), w: 320, h: 1119, hot: [230, 520], title: "Valores prontos em carrossel", note: "R$ 50, 80, 120 e 400 já sugeridos. Antes de pagar, a pessoa vê quantas milhas acumula, com Cliente Smiles e Clube Smiles/Diamante lado a lado." },
            { img: U("ohrlv33330BFdtEqX3IzLNpUxQ"), w: 320, h: 1071, hot: [92, 500], title: "Escolha outro valor", note: "No fim do carrossel, um card abre a digitação livre para quem precisa de um valor fora das sugestões." },
            { img: U("BncksBpS5bi8vA3CNkzxl74xGL4"), w: 320, h: 567, hot: [150, 470], title: "Limite visível antes do erro", note: "O campo abre num bottom sheet já mostrando a regra: mínimo de R$ 50 e máximo de R$ 400." },
            { img: U("1GvaktkwB5pbwuXhMn8nY5P4pc"), w: 320, h: 568, hot: [160, 400], tag: "Estado de erro", title: "Erro que diz o que fazer", note: "Fora do limite, a mensagem não só acusa o erro: pede um valor entre R$ 50 e R$ 400." },
            { img: U("1APiK1odCxwL6AaXGBkaFvTtNM"), w: 320, h: 568, hot: [292, 545], title: "Valor dentro da regra", note: "Com um valor válido, o check do teclado confirma e devolve para a compra." },
            { img: U("o3NC4rX5jE3AcxcVr4SB8gynxk"), w: 320, h: 1071, hot: [161, 1030], title: "Milhas recalculadas na hora", note: "O card de acúmulo atualiza com o valor digitado (450 ou 600 milhas), reforçando a vantagem de comprar pela Smiles." },
            { img: U("LWuJNxLnN10Corz1fOxvvj0F9U"), w: 320, h: 1605, hot: [34, 822], title: "Resumo e aceite dos termos", note: "Produto, valor e total numa tela só. O pagamento só libera depois do aceite dos Termos e condições da Uber." },
            { img: U("q1Ww2eQBJaGQZ2bCWqrzMbSJwrs"), w: 416, h: 1667, crop: CROP, hot: [160, 1554], title: "Pagamento liberado", note: "Com o aceite e o cartão escolhido, 'Confirmar pagamento' fica ativo. O Uber Pass aparece como oferta, sem interromper a compra." },
            { img: U("oiudgz3aTCAaipnxTghNb6Hc4I"), w: 320, h: 568, tag: "Carregamento", title: "Espera com feedback", note: "Splash de confirmação no lugar de um spinner genérico." },
            { img: U("nZu4R34gL0MhxDN3xcT18BI6mEY"), w: 320, h: 1792, hot: [160, 504], title: "Sucesso com próximo passo", note: "A confirmação diz onde está o voucher (e-mail e Meu Uber) e mostra as milhas ganhas na compra." },
        ],
    },
    {
        label: "Resgatar",
        intro: "Os mesmos créditos, pagos com milhas.",
        steps: [
            { img: U("f6nRIRIkhBjotnmdjD2ykwUFfJg"), w: 320, h: 1092, hot: [161, 1022], title: "Mesmos valores, pagos com milhas", note: "A aba Resgatar repete o carrossel e mostra quanto cada valor custa em milhas para cada perfil." },
            { img: U("tNPit3m5PJv9qX2e9T0LjnLzJVw"), w: 416, h: 1063, crop: CROP, hot: [160, 967], title: "Resumo do resgate", note: "A mesma estrutura do pagamento em dinheiro: menos coisa nova para aprender." },
            { img: U("Wq8gQtKQFHhNhlRyQe4FdSxXvTk"), w: 320, h: 568, hot: [160, 500], tag: "Exceção", title: "Milhas insuficientes", note: "Se o saldo não cobre o valor, um bottom sheet avisa e oferece um caminho, em vez de um erro seco." },
            { img: U("r7RXr8rkqzIsYwRSeDO1viOQVtU"), w: 320, h: 568, hot: [160, 500], tag: "Exceção", title: "Aviso antes de sair", note: "Fechar no meio do pagamento abre uma confirmação, para ninguém perder o que já preencheu." },
            { img: U("oyrPZi35T7joACcsOaLcudnYJnk"), w: 320, h: 1485, hot: [160, 504], title: "Resgate confirmado", note: "Sucesso no mesmo padrão da compra, com atalho para o Meu Uber." },
        ],
    },
    {
        label: "Meu Uber",
        intro: "Onde ficam os vouchers depois da compra.",
        steps: [
            { img: U("nz2HYT2RbigllKm5yExUiGCNsNY"), w: 320, h: 1242, hot: [80, 365], title: "Pedidos num lugar só", note: "Status, valor e ações de cada voucher: reenviar o código ou cancelar." },
            { img: U("LjscVQjSVQwjyA1vB8EFjCPXOKI"), w: 320, h: 568, hot: [160, 500], title: "Cancelamento com confirmação", note: "Cancelar acontece num passo de confirmação, sem sair do Meu Uber." },
            { img: U("omMq7FTW0tRyGeD7mfUCzNRxOY"), w: 320, h: 568, hot: [160, 455], tag: "Estado vazio", title: "Sem pedidos, sem tela em branco", note: "O estado vazio leva direto para a compra de créditos." },
        ],
    },
    {
        label: "Uber Pass",
        intro: "Assinatura de 6 meses oferecida dentro do fluxo.",
        steps: [
            { img: U("gOCNRolf3AKZFwnOj8tQAADedc"), w: 320, h: 1093, hot: [240, 885], title: "Oferta no contexto", note: "A assinatura aparece como card secundário na tela de compra, sem competir com a tarefa principal." },
            { img: U("2uH9zrT4KX9j9i8T6m0OyOouKYY"), w: 320, h: 688, hot: [160, 628], title: "Adesão com termos", note: "O modal só libera 'Assinar' depois do aceite dos termos do Uber Pass." },
            { img: U("e9Dxdcp0OV8QFOLt3lruxQS6PI8"), w: 320, h: 824, tag: "Detalhe", title: "Benefícios a um toque", note: "Descontos e vantagens explicados sem sair do app, para decidir com informação." },
        ],
    },
]

const FONT = "'Inter Tight', 'Inter', system-ui, sans-serif"
const EASE = [0.22, 0.61, 0.36, 1] as const
const INK = "#15140F"
const PAPER = "#FAFAF7"
const ACCENT = "#C8F31D"

export default function UberPrototype() {
    const reduce = useReducedMotion()
    const rootRef = useRef<HTMLDivElement>(null)
    const viewRef = useRef<HTMLDivElement>(null)
    const inView = useInView(rootRef, { margin: "-15% 0px -15% 0px" })
    const [f, setF] = useState(0)
    const [s, setS] = useState(0)
    const [playing, setPlaying] = useState(true)
    const [viewW, setViewW] = useState(300)
    const [wide, setWide] = useState(true)
    const [tapped, setTapped] = useState(false)

    const flow = FLOWS[f]
    const step = flow.steps[s]
    const total = FLOWS.reduce((a, x) => a + x.steps.length, 0)
    const globalIndex = FLOWS.slice(0, f).reduce((a, x) => a + x.steps.length, 0) + s

    useEffect(() => {
        const measure = () => {
            const v = viewRef.current
            const r = rootRef.current
            if (v) startTransition(() => setViewW(v.offsetWidth))
            if (r) startTransition(() => setWide(r.offsetWidth >= 760))
        }
        measure()
        const ro = new ResizeObserver(measure)
        if (rootRef.current) ro.observe(rootRef.current)
        window.addEventListener("resize", measure)
        return () => {
            ro.disconnect()
            window.removeEventListener("resize", measure)
        }
    }, [])

    const [ct, cr, cb, cl] = step.crop || [0, 0, 0, 0]
    const visW = step.w - cl - cr
    const visH = step.h - ct - cb
    const scale = viewW / visW
    const viewH = viewW * (568 / 320)
    const contentH = visH * scale
    const maxScroll = Math.max(0, contentH - viewH)
    const target = step.hot ? Math.min(maxScroll, Math.max(0, step.hot[1] * scale - viewH * 0.62)) : 0
    const scrollDur = reduce ? 0 : Math.min(2.6, Math.max(0.6, target / 260))
    const animated = !reduce

    const go = (nf: number, ns: number) => {
        startTransition(() => {
            setTapped(false)
            setF(nf)
            setS(ns)
        })
    }
    const next = () => {
        if (s < flow.steps.length - 1) go(f, s + 1)
        else go((f + 1) % FLOWS.length, 0)
    }
    const prev = () => {
        if (s > 0) go(f, s - 1)
        else {
            const pf = (f - 1 + FLOWS.length) % FLOWS.length
            go(pf, FLOWS[pf].steps.length - 1)
        }
    }
    const userAction = (fn: () => void) => {
        startTransition(() => setPlaying(false))
        fn()
    }
    const tap = () => {
        startTransition(() => {
            setPlaying(false)
            setTapped(true)
        })
        window.setTimeout(next, animated ? 260 : 0)
    }

    useEffect(() => {
        if (!playing || !inView || !animated) return
        const wait = (0.35 + scrollDur + (step.hot ? 1.9 : 1.6)) * 1000
        const t = window.setTimeout(next, wait)
        return () => window.clearTimeout(t)
    }, [playing, inView, animated, f, s, scrollDur])

    const pill: CSSProperties = {
        fontFamily: FONT,
        fontSize: 15,
        fontWeight: 500,
        padding: "12px 20px",
        minHeight: 44,
        borderRadius: 999,
        border: `1px solid ${PAPER}`,
        background: "transparent",
        color: PAPER,
        cursor: "pointer",
        transition: "background .45s cubic-bezier(.33,1,.68,1), color .45s cubic-bezier(.33,1,.68,1)",
    }
    const muted = "rgba(250,250,247,0.6)"

    const phone = (
        <div style={{ width: wide ? 340 : "100%", maxWidth: 340, flex: "none", display: "flex", flexDirection: "column", gap: 18, margin: wide ? 0 : "0 auto" }}>
            <div style={{ borderRadius: 42, padding: 9, background: "#000", boxShadow: "0 0 0 1px rgba(250,250,247,0.12), 0 50px 90px -40px rgba(0,0,0,0.7)" }}>
                <div
                    ref={viewRef}
                    role="button"
                    tabIndex={0}
                    aria-label={`Tela: ${step.title}. Toque para avançar`}
                    onClick={tap}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            tap()
                        }
                    }}
                    style={{ position: "relative", width: "100%", aspectRatio: "320 / 568", overflow: "hidden", borderRadius: 34, background: "#fff", cursor: "pointer", outlineOffset: 4 }}
                >
                    <AnimatePresence initial={false} mode="popLayout">
                        <motion.div
                            key={`${f}-${s}`}
                            initial={animated ? { x: 50, opacity: 0 } : false}
                            animate={{ x: 0, opacity: 1 }}
                            exit={animated ? { x: -50, opacity: 0 } : undefined}
                            transition={{ duration: 0.5, ease: EASE }}
                            style={{ position: "absolute", inset: 0 }}
                        >
                            <motion.div
                                initial={{ y: 0 }}
                                animate={{ y: -target }}
                                transition={{ delay: animated ? 0.35 : 0, duration: scrollDur, ease: [0.45, 0, 0.2, 1] }}
                                style={{ position: "absolute", left: 0, top: 0, width: "100%", height: contentH }}
                            >
                                <img src={step.img} alt="" draggable={false} style={{ position: "absolute", top: -ct * scale, left: -cl * scale, width: step.w * scale, maxWidth: "none", height: "auto", display: "block", userSelect: "none" }} />
                                {step.hot && (
                                    <motion.span
                                        aria-hidden="true"
                                        initial={{ opacity: 0, scale: 0.4 }}
                                        animate={{ opacity: 1, scale: tapped ? 0.7 : 1 }}
                                        transition={{ delay: animated && !tapped ? 0.35 + scrollDur : 0, duration: 0.3 }}
                                        style={{ position: "absolute", left: step.hot[0] * scale - 22, top: step.hot[1] * scale - 22, width: 44, height: 44, pointerEvents: "none" }}
                                    >
                                        {animated && (
                                            <motion.span
                                                animate={{ scale: [1, 1.9], opacity: [0.6, 0] }}
                                                transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
                                                style={{ position: "absolute", inset: 0, borderRadius: "50%", background: ACCENT }}
                                            />
                                        )}
                                        <span style={{ position: "absolute", inset: 10, borderRadius: "50%", background: ACCENT, boxShadow: `0 0 0 2px ${INK}` }} />
                                    </motion.span>
                                )}
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
            <div style={{ height: 2, background: "rgba(250,250,247,0.15)", position: "relative", overflow: "hidden", borderRadius: 2 }} aria-hidden="true">
                <motion.div animate={{ width: `${((globalIndex + 1) / total) * 100}%` }} transition={{ duration: 0.5, ease: EASE }} style={{ position: "absolute", left: 0, top: 0, bottom: 0, background: PAPER }} />
            </div>
        </div>
    )

    const panel = (
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 36, fontFamily: FONT }}>
            <div role="tablist" aria-label="Fluxos" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {FLOWS.map((x, i) => (
                    <button
                        key={x.label}
                        role="tab"
                        aria-selected={i === f}
                        onClick={() => userAction(() => go(i, 0))}
                        style={{ ...pill, background: i === f ? PAPER : "transparent", color: i === f ? INK : PAPER, borderColor: i === f ? PAPER : "rgba(250,250,247,0.3)" }}
                    >
                        {x.label}
                    </button>
                ))}
            </div>
            <div aria-live="polite" style={{ display: "flex", flexDirection: "column", gap: 16, minHeight: 230 }}>
                <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: muted }}>
                    {String(s + 1).padStart(2, "0")} / {String(flow.steps.length).padStart(2, "0")} · {flow.intro}
                </div>
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={`${f}-${s}`}
                        initial={animated ? { y: 16, opacity: 0 } : false}
                        animate={{ y: 0, opacity: 1 }}
                        exit={animated ? { y: -10, opacity: 0 } : undefined}
                        transition={{ duration: 0.45, ease: EASE }}
                        style={{ display: "flex", flexDirection: "column", gap: 16 }}
                    >
                        {step.tag && <span style={{ alignSelf: "flex-start", fontSize: 12, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: INK, background: ACCENT, borderRadius: 999, padding: "5px 12px" }}>{step.tag}</span>}
                        <h3 style={{ margin: 0, fontWeight: 700, fontSize: wide ? 46 : 32, lineHeight: 1.05, color: PAPER, letterSpacing: "-0.04em" }}>{step.title}</h3>
                        <p style={{ margin: 0, fontSize: 19, lineHeight: 1.55, color: "rgba(250,250,247,0.82)", maxWidth: 540 }}>{step.note}</p>
                    </motion.div>
                </AnimatePresence>
            </div>
            <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: 6 }} aria-label="Etapas do fluxo">
                {flow.steps.map((x, i) => (
                    <li key={i}>
                        <button
                            onClick={() => userAction(() => go(f, i))}
                            aria-current={i === s ? "step" : undefined}
                            aria-label={`Etapa ${i + 1}: ${x.title}`}
                            title={x.title}
                            style={{ width: 40, height: 40, borderRadius: "50%", fontFamily: FONT, fontSize: 13, fontWeight: 500, border: `1px solid ${i === s ? PAPER : "rgba(250,250,247,0.3)"}`, background: i === s ? PAPER : "transparent", color: i === s ? INK : PAPER, cursor: "pointer", transition: "background .35s, color .35s" }}
                        >
                            {i + 1}
                        </button>
                    </li>
                ))}
            </ol>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                <button style={pill} onClick={() => userAction(prev)} aria-label="Etapa anterior">
                    ← Voltar
                </button>
                <button style={{ ...pill, background: PAPER, color: INK }} onClick={() => userAction(next)} aria-label="Próxima etapa">
                    Próximo →
                </button>
                {animated && (
                    <button style={{ ...pill, border: "none", color: muted }} onClick={() => startTransition(() => setPlaying(!playing))} aria-pressed={playing}>
                        {playing ? "Pausar" : "Reproduzir"}
                    </button>
                )}
            </div>
        </div>
    )

    return (
        <div ref={rootRef} style={{ width: "100%", display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 96 : 40, alignItems: wide ? "center" : "stretch" }}>
            {phone}
            {panel}
        </div>
    )
}
