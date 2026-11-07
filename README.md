# annacabral.com

Portfólio de Anna Cabral, Product Designer. Site estático em [Astro](https://astro.build), com os componentes interativos em React e animações com Framer Motion.

## Como editar

- Textos da home: `src/pages/index.astro`
- Textos dos cases: `src/pages/cases/*.astro`
- Cores e tipografia: `src/styles/global.css`
- Imagens: `public/img` (a automação "Baixar imagens" baixou as originais do Framer)

## Rodar no computador

```bash
npm install
npm run dev
```

## Publicação

Cada commit na branch `main` publica automaticamente na Vercel.

## Versão em inglês

As páginas em `src/pages/en/` são geradas a partir das páginas em português. Depois de mudar um texto em PT, atualize a tradução correspondente em `scripts/make-en.py` e rode `python3 scripts/make-en.py`. O script avisa se algum trecho ficou sem tradução.
