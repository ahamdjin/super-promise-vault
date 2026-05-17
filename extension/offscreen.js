let workerPromise = null

function normalizeOcrText(value) {
  return String(value || "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim()
}

async function getWorker() {
  if (!workerPromise) {
    workerPromise = Tesseract.createWorker("eng", 1, {
      workerPath: chrome.runtime.getURL("vendor/tesseract/worker.min.js"),
      corePath: chrome.runtime.getURL("vendor/tesseract-core/"),
      langPath: chrome.runtime.getURL("vendor/tessdata/"),
      workerBlobURL: false,
      cacheMethod: "none",
      logger: () => {}
    })
  }

  return workerPromise
}

async function recognizeImage(imageDataUrl) {
  if (!imageDataUrl) {
    throw new Error("No image data was provided for OCR.")
  }

  const worker = await getWorker()
  const result = await worker.recognize(imageDataUrl)
  const text = normalizeOcrText(result?.data?.text || "")

  return {
    ok: true,
    text,
    confidence: Number.isFinite(result?.data?.confidence) ? result.data.confidence / 100 : 0,
    rawConfidence: result?.data?.confidence ?? null
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.target !== "spv-offscreen" || message?.type !== "spv:recognizeImage") {
    return false
  }

  recognizeImage(message.imageDataUrl)
    .then((result) =>
      sendResponse({
        ...result,
        requestId: message.requestId
      })
    )
    .catch((error) =>
      sendResponse({
        ok: false,
        requestId: message.requestId,
        error: error?.message || "OCR failed."
      })
    )

  return true
})
