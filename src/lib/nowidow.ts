// Une as duas últimas palavras com espaço fixo para nunca sobrar uma palavra sozinha na linha.
export const nw = (s: string) => (s.trim().split(/\s+/).length < 3 ? s : s.replace(/\s+(\S+)\s*$/, " $1"))
