const STORAGE_KEY = "supportPromiseVaultCaptures"
const MAX_CAPTURES = 12

const state = {
  activeTab: null,
  pageContext: null,
  pageProof: null,
  captureStrategy: null,
  fullCaptureResult: null,
  lastSavedCapture: null,
  previewCapture: null
}

const els = {
  pageStatus: document.getElementById("page-status"),
  pageTitle: document.getElementById("page-title"),
  pageUrl: document.getElementById("page-url"),
  pageSelection: document.getElementById("page-selection"),
  detectedProvider: document.getElementById("detected-provider"),
  detectedSurface: document.getElementById("detected-surface"),
  detectedCompany: document.getElementById("detected-company"),
  detectedCaseId: document.getElementById("detected-case-id"),
  detectedAmount: document.getElementById("detected-amount"),
  detectedPromise: document.getElementById("detected-promise"),
  detectedAttachments: document.getElementById("detected-attachments"),
  proofPanel: document.getElementById("proof-panel"),
  proofImage: document.getElementById("proof-image"),
  viewCurrentProof: document.getElementById("view-current-proof"),
  downloadCurrentProof: document.getElementById("download-current-proof"),
  company: document.getElementById("company"),
  caseId: document.getElementById("case-id"),
  issueTitle: document.getElementById("issue-title"),
  promisedOutcome: document.getElementById("promised-outcome"),
  amount: document.getElementById("amount"),
  followUpAt: document.getElementById("follow-up-at"),
  internalNote: document.getElementById("internal-note"),
  feedback: document.getElementById("feedback"),
  recentCaptures: document.getElementById("recent-captures"),
  form: document.getElementById("capture-form"),
  runFullCaptureButton: document.getElementById("run-full-capture"),
  useQuickCaptureButton: document.getElementById("use-quick-capture"),
  refreshButton: document.getElementById("refresh-page"),
  exportButton: document.getElementById("export-case"),
  clearButton: document.getElementById("clear-captures"),
  previewDialog: document.getElementById("capture-preview-dialog"),
  closePreview: document.getElementById("close-preview"),
  previewCompany: document.getElementById("preview-company"),
  previewIssue: document.getElementById("preview-issue"),
  previewPromise: document.getElementById("preview-promise"),
  previewFollowup: document.getElementById("preview-followup"),
  previewImage: document.getElementById("preview-image"),
  previewTranscript: document.getElementById("preview-transcript"),
  previewAttachments: document.getElementById("preview-attachments"),
  previewOpenProof: document.getElementById("preview-open-proof"),
  previewDownloadProof: document.getElementById("preview-download-proof"),
  previewOpenPage: document.getElementById("preview-open-page")
}

init().catch((error) => {
  console.error(error)
  setFeedback("Failed to load the current tab.", true)
})

async function init() {
  bindEvents()
  await hydrateCurrentTab()
  await renderSavedCaptures()
}

function bindEvents() {
  els.form.addEventListener("submit", onSaveCapture)
  els.runFullCaptureButton.addEventListener("click", onRunFullCapture)
  els.useQuickCaptureButton.addEventListener("click", () => {
    state.fullCaptureResult = null
    setFeedback("Quick capture mode selected.")
  })
  els.refreshButton.addEventListener("click", async () => {
    await hydrateCurrentTab()
    setFeedback("Auto-capture refreshed.")
  })
  els.exportButton.addEventListener("click", onExportLastCapture)
  els.clearButton.addEventListener("click", onClearCaptures)
  els.viewCurrentProof.addEventListener("click", () => {
    if (state.pageProof) {
      openProof(state.pageProof)
    }
  })
  els.downloadCurrentProof.addEventListener("click", () => {
    if (state.pageProof) {
      downloadProof(state.pageProof)
    }
  })
  els.closePreview.addEventListener("click", () => els.previewDialog.close())
  els.previewOpenProof.addEventListener("click", () => {
    const proof = state.previewCapture?.proof
    if (proof?.dataUrl) {
      openProof(proof)
    }
  })
  els.previewDownloadProof.addEventListener("click", () => {
    const capture = state.previewCapture
    if (capture?.proof?.dataUrl) {
      downloadProof(capture.proof, `${capture.company || "support-case"}-proof`)
    }
  })
  els.previewOpenPage.addEventListener("click", async () => {
    const pageUrl = state.previewCapture?.pageUrl
    if (pageUrl) {
      await chrome.tabs.create({ url: pageUrl })
    }
  })
}

async function hydrateCurrentTab() {
  setStatus("Scanning", false)
  setFeedback("")

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  state.activeTab = tab || null

  if (!tab || !tab.id) {
    setStatus("No tab", true)
    return
  }

  els.pageTitle.textContent = tab.title || "-"
  els.pageUrl.textContent = tab.url || "-"

  let pageContext = null
  try {
    const pageContexts = await sendMessageToAllFrames(tab.id, { type: "spv:getPageContext" })
    pageContext = mergeFrameContexts(pageContexts)
  } catch (error) {
    console.error(error)
  }

  let pageProof = null
  try {
    pageProof = await captureVisibleProof(tab, pageContext?.proofTargetRect || null)
  } catch (error) {
    console.error(error)
  }

  state.pageContext = pageContext
  state.pageProof = pageProof
  state.captureStrategy = resolveCaptureStrategy(pageContext)
  state.fullCaptureResult = null

  const transcript = pageContext?.transcript || pageContext?.selection || ""
  const providerName = pageContext?.provider?.name || "Generic page"
  const surface = formatSurface(pageContext?.supportSurface)
  const companyGuess = titleize(pageContext?.companyGuess || safeHost(tab.url || "").split(".")[0] || "")
  const caseIdGuess = cleanGuess(pageContext?.caseId)
  const amountGuess = cleanGuess(pageContext?.amount)
  const promiseGuess = cleanGuess(pageContext?.promisedOutcome)
  const issueGuess = cleanGuess(pageContext?.issueTitleGuess)

  els.pageSelection.textContent =
    transcript ||
    "No support transcript detected yet. If the widget lives inside a protected iframe, the screenshot proof still gives you something real to save."
  els.detectedProvider.textContent = providerName
  els.detectedSurface.textContent = surface
  els.detectedCompany.textContent = companyGuess || "-"
  els.detectedCaseId.textContent = caseIdGuess || "-"
  els.detectedAmount.textContent = amountGuess || "-"
  els.detectedPromise.textContent = promiseGuess || "-"
  renderAttachmentList(els.detectedAttachments, pageContext?.attachments || [], "No visible attachments detected.")

  if (!els.company.value) {
    els.company.value = companyGuess
  }
  if (!els.issueTitle.value) {
    els.issueTitle.value = issueGuess || pageContext?.title || tab.title || ""
  }
  if (!els.caseId.value && caseIdGuess) {
    els.caseId.value = caseIdGuess
  }
  if (!els.amount.value && amountGuess) {
    els.amount.value = amountGuess
  }
  if (!els.promisedOutcome.value && promiseGuess) {
    els.promisedOutcome.value = promiseGuess
  }
  if (!els.internalNote.value && transcript) {
    els.internalNote.value = transcript.slice(0, 1100)
  }

  renderCurrentProof()
  setStatus(transcript ? "Transcript" : pageProof ? "Proof ready" : "Ready", false)
}

async function captureVisibleProof(tab, targetRect) {
  if (!tab?.windowId) {
    return null
  }

  const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
    format: "jpeg",
    quality: 72
  })

  if (!dataUrl) {
    return null
  }

  const filenameStem = sanitizeFilename(
    titleize(state.pageContext?.companyGuess || safeHost(tab.url || "").split(".")[0] || "support-proof")
  )

  const croppedDataUrl = await cropProofToRect(dataUrl, tab, targetRect)

  return {
    type: "screenshot",
    mimeType: "image/jpeg",
    dataUrl: croppedDataUrl || dataUrl,
    filename: `${filenameStem || "support-proof"}-${Date.now()}.jpg`,
    capturedAt: new Date().toISOString()
  }
}

async function cropProofToRect(dataUrl, tab, rect) {
  if (!rect || !tab?.width || !tab?.height) {
    return dataUrl
  }

  const image = await loadImage(dataUrl)
  const scaleX = image.width / tab.width
  const scaleY = image.height / tab.height
  const sourceX = Math.max(0, Math.floor(rect.x * scaleX))
  const sourceY = Math.max(0, Math.floor(rect.y * scaleY))
  const sourceWidth = Math.max(1, Math.floor(rect.width * scaleX))
  const sourceHeight = Math.max(1, Math.floor(rect.height * scaleY))
  const cropWidth = Math.min(sourceWidth, image.width - sourceX)
  const cropHeight = Math.min(sourceHeight, image.height - sourceY)

  if (cropWidth <= 0 || cropHeight <= 0) {
    return dataUrl
  }

  const canvas = document.createElement("canvas")
  canvas.width = cropWidth
  canvas.height = cropHeight
  const context = canvas.getContext("2d")

  if (!context) {
    return dataUrl
  }

  context.drawImage(image, sourceX, sourceY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight)
  return canvas.toDataURL("image/jpeg", 0.86)
}

function renderCurrentProof() {
  const proof = state.pageProof

  if (!proof?.dataUrl) {
    els.proofPanel.classList.add("is-hidden")
    els.proofImage.removeAttribute("src")
    return
  }

  els.proofImage.src = proof.dataUrl
  els.proofPanel.classList.remove("is-hidden")
}

async function onSaveCapture(event) {
  event.preventDefault()

  const capture = buildCapture()
  state.lastSavedCapture = capture

  const existing = await getCaptures()
  const next = [capture, ...existing].slice(0, MAX_CAPTURES)
  await chrome.storage.local.set({ [STORAGE_KEY]: next })

  await renderSavedCaptures()
  setFeedback("Capture saved locally with proof.")
}

async function onRunFullCapture() {
  if (!state.activeTab?.id) {
    setFeedback("No active tab available for full capture.", true)
    return
  }

  setStatus("Capturing", false)
  setFeedback("Running full-thread capture...")

  try {
    const frameResults = await sendMessageToAllFrames(state.activeTab.id, { type: "spv:runFullCapture" })
    const result = selectBestFullCaptureResult(frameResults)
    state.fullCaptureResult = result || null

    if (result?.status === "completed") {
      const chunkCount = Array.isArray(result.chunks) ? result.chunks.length : 0
      if (!els.internalNote.value && result.stitchedText) {
        els.internalNote.value = result.stitchedText.slice(0, 1400)
      }
      els.pageSelection.textContent = result.stitchedText || els.pageSelection.textContent
      renderAttachmentList(
        els.detectedAttachments,
        result.attachments || state.pageContext?.attachments || [],
        "No visible attachments detected."
      )
      setStatus("Full thread", false)
      setFeedback(`Full capture collected ${chunkCount} chunk${chunkCount === 1 ? "" : "s"}.`)
      return
    }

    if (result?.status === "needs-ocr") {
      const ocrResult = await runOcrFallback(result)
      if (ocrResult?.status === "completed") {
        state.fullCaptureResult = ocrResult
        if (!els.internalNote.value && ocrResult.stitchedText) {
          els.internalNote.value = ocrResult.stitchedText.slice(0, 1400)
        }
        els.pageSelection.textContent = ocrResult.stitchedText || els.pageSelection.textContent
        renderAttachmentList(
          els.detectedAttachments,
          ocrResult.attachments || state.pageContext?.attachments || [],
          "No visible attachments detected."
        )
        setStatus("OCR thread", false)
        setFeedback("Locked chat captured with local OCR from the cropped proof.")
        return
      }

      setStatus("OCR needed", true)
      setFeedback(ocrResult?.reason || result.reason || "This widget needs OCR-based full capture.", true)
      return
    }

    setStatus("Limited", true)
    setFeedback(result?.reason || "Full capture is not available on this page yet.", true)
  } catch (error) {
    console.error(error)
    setStatus("Failed", true)
    setFeedback("Full capture failed on this page.", true)
  }
}

async function sendMessageToAllFrames(tabId, message) {
  let frames = [{ frameId: 0, url: state.activeTab?.url || "" }]

  try {
    const discoveredFrames = await chrome.webNavigation.getAllFrames({ tabId })
    if (Array.isArray(discoveredFrames) && discoveredFrames.length) {
      frames = discoveredFrames
    }
  } catch (error) {
    console.warn("Frame discovery failed; falling back to the top frame.", error)
  }

  const responses = []

  await Promise.all(
    frames.map(async (frame) => {
      try {
        const response = await chrome.tabs.sendMessage(tabId, message, { frameId: frame.frameId })
        if (response) {
          responses.push({
            ...response,
            frameId: frame.frameId,
            frameUrl: frame.url || response.url || ""
          })
        }
      } catch {
        // Some frames intentionally reject extension messages. That is normal on protected browser pages.
      }
    })
  )

  return responses
}

function scoreFrameContext(context) {
  const transcriptLength = cleanGuess(context?.transcript).length
  const selectionLength = cleanGuess(context?.selection).length
  const providerScore = context?.provider?.score || 0
  const surfaceScore = context?.supportSurface === "transcript" ? 40 : context?.supportSurface === "widget" ? 18 : 0
  const attachmentScore = Array.isArray(context?.attachments) ? context.attachments.length * 5 : 0
  return surfaceScore + providerScore * 3 + Math.min(transcriptLength / 40, 35) + Math.min(selectionLength / 80, 8) + attachmentScore
}

function mergeFrameContexts(contexts) {
  if (!Array.isArray(contexts) || !contexts.length) {
    return null
  }

  const topContext = contexts.find((context) => context.frameId === 0) || contexts[0]
  const bestContext = [...contexts].sort((a, b) => scoreFrameContext(b) - scoreFrameContext(a))[0] || topContext
  const topProvider = topContext?.provider?.score > bestContext?.provider?.score ? topContext.provider : bestContext.provider
  const topProofTargetRect = topContext?.proofTargetRect || topContext?.transcriptRect || null
  const safeProofTargetRect = bestContext.frameId === 0 ? bestContext.proofTargetRect || topProofTargetRect : topProofTargetRect

  return {
    ...bestContext,
    provider: topProvider || bestContext.provider,
    proofTargetRect: safeProofTargetRect || bestContext.proofTargetRect || null,
    supportSurface:
      bestContext.supportSurface === "transcript" || topContext.supportSurface !== "widget"
        ? bestContext.supportSurface
        : topContext.supportSurface,
    frameCapture: {
      selectedFrameId: bestContext.frameId,
      selectedFrameUrl: bestContext.frameUrl || bestContext.url || "",
      scannedFrameCount: contexts.length,
      topFrameHadProofTarget: Boolean(topProofTargetRect)
    }
  }
}

function selectBestFullCaptureResult(results) {
  if (!Array.isArray(results) || !results.length) {
    return {
      status: "unsupported",
      reason: "No extension-readable frames responded.",
      chunks: [],
      attachments: []
    }
  }

  const completed = results
    .filter((result) => result.status === "completed")
    .sort((a, b) => cleanGuess(b.stitchedText).length - cleanGuess(a.stitchedText).length)

  if (completed.length) {
    return {
      ...completed[0],
      frameCapture: {
        selectedFrameId: completed[0].frameId,
        selectedFrameUrl: completed[0].frameUrl || ""
      }
    }
  }

  const needsOcr = results.find((result) => result.status === "needs-ocr")
  if (needsOcr) {
    return needsOcr
  }

  return results[0]
}

async function runOcrFallback(captureResult) {
  if (!state.pageProof?.dataUrl) {
    return {
      status: "needs-ocr",
      reason: "OCR fallback needs a screenshot proof first."
    }
  }

  setStatus("OCR running", false)
  setFeedback("Reading the cropped chat proof locally with OCR. First run can take a little longer.")

  const ocrResponse = await chrome.runtime.sendMessage({
    type: "spv:ocrImage",
    requestId: `ocr-${Date.now()}`,
    imageDataUrl: state.pageProof.dataUrl
  })

  if (!ocrResponse?.ok) {
    return {
      status: "needs-ocr",
      reason: ocrResponse?.error || "OCR did not return usable text."
    }
  }

  const ocrText = cleanGuess(ocrResponse.text)
  if (!ocrText) {
    return {
      status: "needs-ocr",
      reason: "OCR ran, but no readable text was found in the cropped chat proof."
    }
  }

  const attachmentHints = extractAttachmentHintsFromText(ocrText, state.pageProof)

  return {
    status: "completed",
    reason: captureResult?.reason || "OCR fallback completed from cropped chat proof.",
    chunks: [
      {
        index: 0,
        sourceType: "ocr-screenshot",
        text: ocrText,
        rect: state.pageContext?.proofTargetRect || null,
        screenshotRef: state.pageProof.filename,
        confidence: Math.max(0.35, Math.min(0.92, ocrResponse.confidence || 0.55))
      }
    ],
    stitchedText: ocrText,
    ocrText,
    attachments: [...(state.pageContext?.attachments || []), ...attachmentHints],
    proofTargetRect: state.pageContext?.proofTargetRect || null,
    strategy: "frame-ocr"
  }
}

function buildCapture() {
  const providerAdapter = globalThis.SPV.detectProviderAdapter(state.pageContext)
  const strategy = state.captureStrategy || globalThis.SPV.planFullThreadCapture(state.pageContext, providerAdapter)

  return globalThis.SPV.createCaptureSession({
    pageContext: state.pageContext,
    pageProof: state.pageProof,
    fullCaptureResult: state.fullCaptureResult,
    providerAdapter,
    strategy,
    formValues: {
      company: els.company.value.trim(),
      caseId: els.caseId.value.trim(),
      issueTitle: els.issueTitle.value.trim(),
      promisedOutcome: els.promisedOutcome.value.trim(),
      amount: els.amount.value.trim(),
      followUpAt: els.followUpAt.value,
      internalNote: els.internalNote.value.trim(),
      pageTitle: state.activeTab?.title || "",
      pageUrl: state.activeTab?.url || ""
    }
  })
}

async function onExportLastCapture() {
  const captures = await getCaptures()
  const capture = state.lastSavedCapture || captures[0]

  if (!capture) {
    setFeedback("No capture available to export.", true)
    return
  }

  const blob = new Blob([JSON.stringify(capture, null, 2)], {
    type: "application/json"
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${sanitizeFilename(capture.company || "case")}-${Date.now()}.json`
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)

  setFeedback("Export started.")
}

async function onClearCaptures() {
  await chrome.storage.local.set({ [STORAGE_KEY]: [] })
  state.lastSavedCapture = null
  state.previewCapture = null
  await renderSavedCaptures()
  setFeedback("Saved captures cleared.")
}

async function renderSavedCaptures() {
  const captures = await getCaptures()
  els.recentCaptures.innerHTML = ""

  if (!captures.length) {
    const empty = document.createElement("p")
    empty.className = "empty-state"
    empty.textContent = "No captures saved yet."
    els.recentCaptures.appendChild(empty)
    return
  }

  captures.forEach((capture) => {
    const row = document.createElement("article")
    row.className = "capture-row"

    row.innerHTML = `
      <div class="capture-row-top">
        <div>
          <p class="capture-title">${escapeHtml(capture.company || "Untitled company")}</p>
          <p class="capture-subtitle">${escapeHtml(capture.issueTitle || "Untitled issue")}</p>
        </div>
        <span class="status-pill muted">${formatDate(capture.followUpAt)}</span>
      </div>
      <div class="capture-badges">
        <span class="status-pill muted">${escapeHtml(capture.providerName || capture.provider?.name || "Generic page")}</span>
        <span class="status-pill muted">${escapeHtml(formatSurface(capture.supportSurface))}</span>
      </div>
      <p class="capture-meta">${escapeHtml(capture.promisedOutcome || "No promise saved.")}</p>
      <div class="capture-actions">
        <button type="button" data-action="load" data-id="${capture.id}">Load</button>
        <button type="button" data-action="preview" data-id="${capture.id}">View proof</button>
        <button type="button" data-action="page" data-id="${capture.id}">Open page</button>
        <button type="button" data-action="copy" data-id="${capture.id}">Copy JSON</button>
      </div>
    `

    row.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => handleCaptureAction(button.dataset.action, capture.id))
    })

    els.recentCaptures.appendChild(row)
  })
}

async function handleCaptureAction(action, captureId) {
  const captures = await getCaptures()
  const capture = captures.find((item) => item.id === captureId)
  if (!capture) {
    return
  }

  if (action === "load") {
    loadCaptureIntoForm(capture)
    setFeedback("Capture loaded into the form.")
    return
  }

  if (action === "preview") {
    openCapturePreview(capture)
    return
  }

  if (action === "page") {
    if (capture.pageUrl) {
      await chrome.tabs.create({ url: capture.pageUrl })
    }
    return
  }

  if (action === "copy") {
    await navigator.clipboard.writeText(JSON.stringify(capture, null, 2))
    setFeedback("Capture JSON copied.")
  }
}

function loadCaptureIntoForm(capture) {
  els.company.value = capture.company || ""
  els.caseId.value = capture.caseId || ""
  els.issueTitle.value = capture.issueTitle || ""
  els.promisedOutcome.value = capture.promisedOutcome || ""
  els.amount.value = capture.amount || ""
  els.followUpAt.value = capture.followUpAt || ""
  els.internalNote.value = capture.internalNote || ""
  state.lastSavedCapture = capture

  if (capture.proof?.dataUrl) {
    state.pageProof = capture.proof
    renderCurrentProof()
  }
}

function openCapturePreview(capture) {
  state.previewCapture = capture
  els.previewCompany.textContent = capture.company || "Untitled company"
  els.previewIssue.textContent = capture.issueTitle || "Untitled issue"
  els.previewPromise.textContent = capture.promisedOutcome || "-"
  els.previewFollowup.textContent = formatDate(capture.followUpAt)
  els.previewTranscript.textContent =
    capture.transcript || capture.selectedText || capture.internalNote || "No transcript saved."
  renderAttachmentList(els.previewAttachments, capture.attachments || [], "No attachments saved.")

  if (capture.proof?.dataUrl) {
    els.previewImage.src = capture.proof.dataUrl
  } else {
    els.previewImage.removeAttribute("src")
  }

  els.previewDialog.showModal()
}

async function getCaptures() {
  const stored = await chrome.storage.local.get(STORAGE_KEY)
  return Array.isArray(stored[STORAGE_KEY]) ? stored[STORAGE_KEY] : []
}

function openProof(proof) {
  chrome.tabs.create({ url: proof.dataUrl })
}

function renderAttachmentList(container, attachments, emptyMessage) {
  container.innerHTML = ""

  if (!attachments.length) {
    const empty = document.createElement("p")
    empty.className = "empty-state"
    empty.textContent = emptyMessage
    container.appendChild(empty)
    return
  }

  attachments.forEach((attachment) => {
    const row = document.createElement("div")
    row.className = "attachment-item"
    const label = escapeHtml(attachment.label || "Attachment")
    const kind = escapeHtml(attachment.kind || "file")
    const url = escapeHtml(attachment.url || "")
    const canOpenUrl = Boolean(attachment.url)

    row.innerHTML = `
      <div class="attachment-copy">
        <strong>${label}</strong>
        <span>${kind}${attachment.source ? ` · ${escapeHtml(attachment.source)}` : ""}</span>
      </div>
      ${
        canOpenUrl
          ? `<a class="attachment-link" href="${url}" target="_blank" rel="noreferrer">Open</a>`
          : `<span class="attachment-link muted-link" title="Only visible in the saved proof screenshot">Proof only</span>`
      }
    `

    container.appendChild(row)
  })
}

function extractAttachmentHintsFromText(text, proof) {
  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
  const attachmentPattern =
    /\b(attached|attachment|uploaded|download|file|image|screenshot|pdf|png|jpe?g|docx?|xlsx?|receipt|invoice)\b/i
  const filePattern = /\b[\w .-]+\.(?:pdf|png|jpe?g|gif|webp|docx?|xlsx?|zip|csv)\b/i

  return lines
    .filter((line) => attachmentPattern.test(line) || filePattern.test(line))
    .slice(0, 4)
    .map((line, index) => ({
      kind: filePattern.test(line) ? "file-evidence" : "attachment-evidence",
      label: line.slice(0, 90),
      url: "",
      source: "ocr",
      proofRef: proof?.filename || "",
      confidence: 0.38 + index * 0.02
    }))
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = dataUrl
  })
}

function downloadProof(proof, filenameStem = "support-proof") {
  const link = document.createElement("a")
  link.href = proof.dataUrl
  link.download = proof.filename || `${sanitizeFilename(filenameStem)}.jpg`
  link.click()
}

function setStatus(text, isError) {
  els.pageStatus.textContent = text
  els.pageStatus.style.background = isError ? "#fee2e2" : ""
  els.pageStatus.style.color = isError ? "#991b1b" : ""
}

function setFeedback(message, isError = false) {
  els.feedback.textContent = message
  els.feedback.style.color = isError ? "#b91c1c" : "#6b7280"
}

function safeHost(value) {
  try {
    return new URL(value).host
  } catch {
    return ""
  }
}

function titleize(value) {
  return value
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function sanitizeFilename(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function formatDate(value) {
  if (!value) {
    return "No date"
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric"
  })
}

function formatSurface(value) {
  if (value === "transcript") {
    return "Transcript found"
  }
  if (value === "widget") {
    return "Widget detected"
  }
  return "Weak signal"
}

function cleanGuess(value) {
  return typeof value === "string" ? value.trim() : ""
}

function resolveCaptureStrategy(pageContext) {
  const providerAdapter = globalThis.SPV.detectProviderAdapter(pageContext)
  return globalThis.SPV.planFullThreadCapture(pageContext, providerAdapter)
}
