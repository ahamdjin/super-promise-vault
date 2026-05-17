const STORAGE_KEY = "supportPromiseVaultCaptures"
const MAX_CAPTURES = 12

const state = {
  activeTab: null,
  pageContext: null,
  pageProof: null,
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
    pageContext = await chrome.tabs.sendMessage(tab.id, { type: "spv:getPageContext" })
  } catch (error) {
    console.error(error)
  }

  let pageProof = null
  try {
    pageProof = await captureVisibleProof(tab)
  } catch (error) {
    console.error(error)
  }

  state.pageContext = pageContext
  state.pageProof = pageProof

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

async function captureVisibleProof(tab) {
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

  return {
    type: "screenshot",
    mimeType: "image/jpeg",
    dataUrl,
    filename: `${filenameStem || "support-proof"}-${Date.now()}.jpg`,
    capturedAt: new Date().toISOString()
  }
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

function buildCapture() {
  const createdAt = new Date().toISOString()
  return {
    id: "capture-" + createdAt,
    provider: state.pageContext?.provider?.name || "Generic page",
    supportSurface: state.pageContext?.supportSurface || "weak",
    company: els.company.value.trim(),
    caseId: els.caseId.value.trim(),
    issueTitle: els.issueTitle.value.trim(),
    promisedOutcome: els.promisedOutcome.value.trim(),
    amount: els.amount.value.trim(),
    followUpAt: els.followUpAt.value,
    internalNote: els.internalNote.value.trim(),
    selectedText: state.pageContext?.selection || "",
    transcript: state.pageContext?.transcript || "",
    pageTitle: state.activeTab?.title || "",
    pageUrl: state.activeTab?.url || "",
    proof: state.pageProof,
    createdAt
  }
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
        <span class="status-pill muted">${escapeHtml(capture.provider || "Generic page")}</span>
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
