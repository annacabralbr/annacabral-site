import { defineConfig } from "astro/config"
import react from "@astrojs/react"
import { fileURLToPath } from "node:url"

export default defineConfig({
    site: "https://annacabral.com",
    integrations: [react()],
    vite: {
        resolve: {
            // os componentes vieram do Framer: "framer" aponta para um adaptador local
            alias: { framer: fileURLToPath(new URL("./src/lib/framer-shim.tsx", import.meta.url)) },
        },
    },
})
