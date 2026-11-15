import { decode, redactedDetection } from '@decoding/engine'

const menuId = 'decoding-inspect-selection'

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() =>
    chrome.contextMenus.create({
      id: menuId,
      title: 'Inspect selection with decod.ing',
      contexts: ['selection'],
    }),
  )
})

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId !== menuId || !info.selectionText) return
  void decode(info.selectionText).then(async (result) => {
    const selected = result.root.selected ?? result.root.candidates[0]
    const redacted = selected
      ? redactedDetection(selected)
      : { status: result.root.status, message: 'No supported format detected.' }
    await chrome.storage.session.set({ redactedResult: redacted })
    await chrome.tabs.create({ url: chrome.runtime.getURL('result.html') })
  })
})

chrome.action.onClicked.addListener(
  () => void chrome.tabs.create({ url: chrome.runtime.getURL('result.html') }),
)
