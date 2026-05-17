(function bootstrapFullThreadCapture(global) {
  function planFullThreadCapture(pageContext, providerAdapter) {
    const hasTranscript = Boolean(global.SPV.cleanText(pageContext?.transcript || ""))
    const hasProofTarget = Boolean(pageContext?.proofTargetRect)
    const providerNeedsOcr = providerAdapter.capabilities?.needsOcrFallback

    let mode = "ocr-first"
    let reason = "No readable transcript found yet."

    if (hasTranscript && providerAdapter.capabilities?.canReadDom) {
      mode = "dom-seeded"
      reason = "Readable transcript exists, but full-thread continuation likely still needs more capture."
    }

    if (hasTranscript && !providerNeedsOcr && providerAdapter.capabilities?.supportsFullThreadScroll) {
      mode = "dom-complete"
      reason = "Provider likely supports a high-quality DOM-first capture path."
    }

    if (!hasTranscript && hasProofTarget) {
      mode = "frame-ocr"
      reason = "Chat frame detected without readable transcript. OCR fallback will be needed."
    }

    return {
      mode,
      reason,
      needsOcr: mode !== "dom-complete",
      shouldScrollThread: true,
      providerId: providerAdapter.id
    }
  }

  global.SPV = {
    ...global.SPV,
    planFullThreadCapture
  }
})(globalThis)
