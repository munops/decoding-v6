export function rotate(source: string, shift: number) {
  return source.replace(/[A-Za-z]/g, (letter) => {
    const base = letter <= 'Z' ? 65 : 97
    return String.fromCharCode(base + ((letter.charCodeAt(0) - base + shift + 26) % 26))
  })
}
export function caesarCandidates(source: string) {
  return Array.from({ length: 25 }, (_, i) => ({ shift: i + 1, text: rotate(source, -(i + 1)) }))
}
