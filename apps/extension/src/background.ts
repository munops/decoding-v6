import { copy } from './copy'
const menuId = 'decoding-inspect-selection'
// Values stay in service-worker memory. No selection enters storage or a URL.
const pending = new Map<string, { text: string; at: number }>()
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() =>
    chrome.contextMenus.create({
      id: menuId,
      title: copy.menu,
      contexts: ['selection'],
    }),
  )
})
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId !== menuId || !info.selectionText) return
  const id = crypto.randomUUID()
  pending.set(id, { text: info.selectionText, at: Date.now() })
  setTimeout(() => pending.delete(id), 60000)
  void chrome.tabs.create({ url: `${chrome.runtime.getURL('result.html')}#${id}` })
})
chrome.runtime.onMessage.addListener((message: unknown, sender, respond) => {
  if (
    sender.id !== chrome.runtime.id ||
    !sender.url?.startsWith(chrome.runtime.getURL('result.html'))
  )
    return
  if (
    !message ||
    typeof message !== 'object' ||
    !('takeSelection' in message) ||
    typeof message.takeSelection !== 'string'
  )
    return
  const item = pending.get(message.takeSelection)
  pending.delete(message.takeSelection)
  respond(item && Date.now() - item.at < 60000 ? { text: item.text } : {})
})
chrome.action.onClicked.addListener(
  () => void chrome.tabs.create({ url: chrome.runtime.getURL('result.html') }),
)
