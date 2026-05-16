const STORAGE_KEY = "supportPromiseVaultCaptures";
const MAX_CAPTURES = 25;

const state = {
  activeTab: null,
  selectedText: "",
  lastSavedCapture: null
};

const els = {
  pageStatus: document.getElementById("page-status"),
  pageTitle: document.getElementById("page-title"),
  pageUrl: document.getElementById("page-url"),
  pageSelection: document.getElementById("page-selection"),
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
  clearButton: document.getElementById("clear-captures")
};

init().catch((error) => {
  console.error(error);
  setFeedback("Failed to load the current tab.", true);
});

async function init() {
  bindEvents();
  await hydrateCurrentTab();
  await renderSavedCaptures();
}

function bindEvents() {
  els.form.addEventListener("submit", onSaveCapture);
  els.refreshButton.addEventListener("click", async () => {
    await hydrateCurrentTab();
    setFeedback("Current page refreshed.");
  });
  els.exportButton.addEventListener("click", onExportLastCapture);
  els.clearButton.addEventListener("click", onClearCaptures);
}

async function hydrateCurrentTab() {
  setStatus("Loading", false);

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  state.activeTab = tab || null;

  if (!tab || !tab.id) {
    setStatus("No tab", true);
    return;
  }

  els.pageTitle.textContent = tab.title || "-";
  els.pageUrl.textContent = tab.url || "-";

  const urlHost = safeHost(tab.url || "");
  if (urlHost && !els.company.value) {
    els.company.value = titleize(urlHost.replace(/^www\./, "").split(".")[0]);
  }

  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => ({
        selection: window.getSelection ? window.getSelection().toString().trim() : "",
        title: document.title || "",
        url: window.location.href
      })
    });

    state.selectedText = result?.selection || "";
    els.pageSelection.textContent = state.selectedText || "No selected text found yet.";

    if (!els.issueTitle.value) {
      els.issueTitle.value = result?.title || tab.title || "";
    }

    if (!els.promisedOutcome.value && state.selectedText) {
      els.promisedOutcome.value = state.selectedText;
    }

    setStatus("Ready", false);
  } catch (error) {
    console.error(error);
    state.selectedText = "";
    els.pageSelection.textContent =
      "Could not read selected text on this page. You can still save the case manually.";
    setStatus("Limited", false);
  }
}

async function onSaveCapture(event) {
  event.preventDefault();

  const capture = buildCapture();
  state.lastSavedCapture = capture;

  const existing = await getCaptures();
  const next = [capture, ...existing].slice(0, MAX_CAPTURES);
  await chrome.storage.local.set({ [STORAGE_KEY]: next });

  await renderSavedCaptures();
  setFeedback("Capture saved locally.");
}

function buildCapture() {
  const createdAt = new Date().toISOString();
  return {
    id: "capture-" + createdAt,
    company: els.company.value.trim(),
    caseId: els.caseId.value.trim(),
    issueTitle: els.issueTitle.value.trim(),
    promisedOutcome: els.promisedOutcome.value.trim(),
    amount: els.amount.value.trim(),
    followUpAt: els.followUpAt.value,
    internalNote: els.internalNote.value.trim(),
    selectedText: state.selectedText,
    pageTitle: state.activeTab?.title || "",
    pageUrl: state.activeTab?.url || "",
    createdAt
  };
}

async function onExportLastCapture() {
  const captures = await getCaptures();
  const capture = state.lastSavedCapture || captures[0];

  if (!capture) {
    setFeedback("No capture available to export.", true);
    return;
  }

  const blob = new Blob([JSON.stringify(capture, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${sanitizeFilename(capture.company || "case")}-${Date.now()}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  setFeedback("Export started.");
}

async function onClearCaptures() {
  await chrome.storage.local.set({ [STORAGE_KEY]: [] });
  state.lastSavedCapture = null;
  await renderSavedCaptures();
  setFeedback("Saved captures cleared.");
}

async function renderSavedCaptures() {
  const captures = await getCaptures();
  els.recentCaptures.innerHTML = "";

  if (!captures.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No captures saved yet.";
    els.recentCaptures.appendChild(empty);
    return;
  }

  captures.forEach((capture) => {
    const row = document.createElement("article");
    row.className = "capture-row";

    row.innerHTML = `
      <div class="capture-row-top">
        <div>
          <p class="capture-title">${escapeHtml(capture.company || "Untitled company")}</p>
          <p class="capture-subtitle">${escapeHtml(capture.issueTitle || "Untitled issue")}</p>
        </div>
        <span class="status-pill muted">${formatDate(capture.followUpAt)}</span>
      </div>
      <p class="capture-meta">${escapeHtml(capture.promisedOutcome || "No promise saved.")}</p>
      <div class="capture-actions">
        <button type="button" data-action="load" data-id="${capture.id}">Load</button>
        <button type="button" data-action="copy" data-id="${capture.id}">Copy JSON</button>
      </div>
    `;

    row.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => handleCaptureAction(button.dataset.action, capture.id));
    });

    els.recentCaptures.appendChild(row);
  });
}

async function handleCaptureAction(action, captureId) {
  const captures = await getCaptures();
  const capture = captures.find((item) => item.id === captureId);
  if (!capture) {
    return;
  }

  if (action === "load") {
    loadCaptureIntoForm(capture);
    setFeedback("Capture loaded into the form.");
    return;
  }

  if (action === "copy") {
    await navigator.clipboard.writeText(JSON.stringify(capture, null, 2));
    setFeedback("Capture JSON copied.");
  }
}

function loadCaptureIntoForm(capture) {
  els.company.value = capture.company || "";
  els.caseId.value = capture.caseId || "";
  els.issueTitle.value = capture.issueTitle || "";
  els.promisedOutcome.value = capture.promisedOutcome || "";
  els.amount.value = capture.amount || "";
  els.followUpAt.value = capture.followUpAt || "";
  els.internalNote.value = capture.internalNote || "";
  state.lastSavedCapture = capture;
}

async function getCaptures() {
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  return Array.isArray(stored[STORAGE_KEY]) ? stored[STORAGE_KEY] : [];
}

function setStatus(text, isError) {
  els.pageStatus.textContent = text;
  els.pageStatus.style.background = isError ? "#fee2e2" : "";
  els.pageStatus.style.color = isError ? "#991b1b" : "";
}

function setFeedback(message, isError = false) {
  els.feedback.textContent = message;
  els.feedback.style.color = isError ? "#b91c1c" : "#475569";
}

function safeHost(value) {
  try {
    return new URL(value).host;
  } catch {
    return "";
  }
}

function titleize(value) {
  return value
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function sanitizeFilename(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDate(value) {
  if (!value) {
    return "No date";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric"
  });
}
