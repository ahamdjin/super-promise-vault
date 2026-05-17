const OFFSCREEN_DOCUMENT_PATH = "offscreen.html"
let creatingOffscreenDocument = null

async function ensureOffscreenDocument() {
  if (!chrome.offscreen) {
    throw new Error("Chrome offscreen documents are not available in this browser.")
  }

  const offscreenUrl = chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH)

  if (chrome.runtime.getContexts) {
    const contexts = await chrome.runtime.getContexts({
      contextTypes: ["OFFSCREEN_DOCUMENT"],
      documentUrls: [offscreenUrl]
    })

    if (contexts.length) {
      return
    }
  }

  if (!creatingOffscreenDocument) {
    creatingOffscreenDocument = chrome.offscreen.createDocument({
      url: OFFSCREEN_DOCUMENT_PATH,
      reasons: ["WORKERS", "BLOBS"],
      justification: "Run local OCR on cropped support chat screenshots without opening a visible page."
    })
  }

  try {
    await creatingOffscreenDocument
  } finally {
    creatingOffscreenDocument = null
  }
}

function sendToOffscreen(payload) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(payload, (response) => {
      const runtimeError = chrome.runtime.lastError
      if (runtimeError) {
        reject(new Error(runtimeError.message))
        return
      }

      if (response?.ok === false) {
        reject(new Error(response.error || "OCR failed."))
        return
      }

      resolve(response)
    })
  })
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "spv:ocrImage") {
    return false
  }

  ensureOffscreenDocument()
    .then(() =>
      sendToOffscreen({
        target: "spv-offscreen",
        type: "spv:recognizeImage",
        requestId: message.requestId,
        imageDataUrl: message.imageDataUrl
      })
    )
    .then((response) => sendResponse(response))
    .catch((error) =>
      sendResponse({
        ok: false,
        error: error?.message || "OCR failed."
      })
    )

  return true
})
