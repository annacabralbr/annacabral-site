// Baixa as imagens que vieram do Framer para public/img, uma vez só.
// Procura no código todos os caminhos "/img/<arquivo>" e baixa os que ainda não existem
// a partir do CDN do Framer (framerusercontent.com/images/<arquivo>).
// Uso: node scripts/fetch-images.mjs
import { readdir, readFile, writeFile, mkdir, access } from "node:fs/promises"
import { join, extname } from "node:path"

const ROOT = new URL("..", import.meta.url).pathname
const OUT = join(ROOT, "public", "img")
const CDN = "https://framerusercontent.com/images/"

async function walk(dir) {
    const out = []
    for (const e of await readdir(dir, { withFileTypes: true })) {
        const p = join(dir, e.name)
        if (e.isDirectory()) out.push(...(await walk(p)))
        else if ([".astro", ".tsx", ".ts"].includes(extname(e.name))) out.push(p)
    }
    return out
}

const files = await walk(join(ROOT, "src"))
const names = new Set()
for (const f of files) {
    const text = await readFile(f, "utf8")
    for (const m of text.matchAll(/["'`(]\/img\/([A-Za-z0-9_-]+\.(?:png|jpe?g|webp))/g)) names.add(m[1])
    // protótipos montam o caminho com U("id") → /img/id.png
    for (const m of text.matchAll(/U\("([A-Za-z0-9_-]+)"\)/g)) names.add(`${m[1]}.png`)
}

await mkdir(OUT, { recursive: true })
let got = 0
let skipped = 0
const failed = []
for (const name of names) {
    const dest = join(OUT, name)
    try {
        await access(dest)
        skipped++
        continue
    } catch {}
    const res = await fetch(CDN + name)
    if (!res.ok) {
        failed.push(`${name} (${res.status})`)
        continue
    }
    await writeFile(dest, Buffer.from(await res.arrayBuffer()))
    got++
}
console.log(`imagens: ${names.size} no código · ${got} baixadas · ${skipped} já existiam`)
if (failed.length) {
    console.error("falharam:\n" + failed.join("\n"))
    process.exitCode = 1
}
