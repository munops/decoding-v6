import './style.css'
import { decode } from '@decoding/engine'
import {
  answerSentence,
  primaryLayers,
  warningTitle,
} from '../../../packages/workbench-ui/src/answer-copy'
import {
  displayValue,
  finalSelection,
  outputText,
} from '../../../packages/workbench-ui/src/result-text'
import { copy, locale } from './copy'
const summary = document.querySelector('#summary')!
const output = document.querySelector('#output')!
const concerns = document.querySelector('#concerns')!
const input = document.querySelector<HTMLTextAreaElement>('#input')!
const button = document.querySelector<HTMLButtonElement>('#copy')!
for (const [id, text] of [
  ['heading', copy.heading],
  ['local', copy.local],
  ['input-label', copy.input],
  ['note', copy.note],
  ['copy', copy.copy],
] as const)
  document.getElementById(id)!.textContent = text
summary.textContent = copy.expired
document.documentElement.lang = locale
let generation = 0
async function run(text: string) {
  const current = ++generation
  if (!text) {
    output.textContent = ''
    summary.textContent = copy.expired
    concerns.textContent = ''
    return
  }
  try {
    const result = await decode(text, { previewAmbiguous: true })
    if (current !== generation) return
    summary.textContent = answerSentence(result.root, locale, text)
    const final = finalSelection(result.root)
    output.textContent = final ? outputText(displayValue(final)) : text
    const warnings = primaryLayers(result.root).flatMap((node) => node.selected?.warnings ?? [])
    concerns.textContent = warnings.length
      ? `${copy.concerns}: ${[...new Set(warnings.map((item) => warningTitle(item, locale)))].join(' ')}`
      : copy.none
  } catch {
    if (current === generation) summary.textContent = copy.failed
  }
}
input.addEventListener('input', () => void run(input.value))
button.addEventListener(
  'click',
  () =>
    void navigator.clipboard.writeText(output.textContent ?? '').then(() => {
      button.textContent = copy.copied
    }),
)
const id = location.hash.slice(1)
history.replaceState(null, '', location.pathname)
if (id)
  void chrome.runtime
    .sendMessage({ takeSelection: id })
    .then((message: { text?: string } | undefined) => {
      if (typeof message?.text === 'string') {
        input.value = message.text
        void run(message.text)
      }
    })
