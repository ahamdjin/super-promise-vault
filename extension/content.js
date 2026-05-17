const PROVIDERS = (globalThis.SPV?.listProviders?.() || []).filter((provider) => provider.id !== "generic")

function isVisible(element) {
  if (!(element instanceof HTMLElement)) {
    return false
  }

  const style = window.getComputedStyle(element)
  if (style.display === "none" || style.visibility === "hidden") {
    return false
  }

  const rect = element.getBoundingClientRect()
  return rect.width > 0 && rect.height > 0
}

function normalizeText(value) {
  return value.replace(/\s+/g, " ").trim()
}

function scoreElement(element) {
  const text = normalizeText(element.innerText || "")
  if (text.length < 40 || !isVisible(element)) {
    return -1
  }

  const signal =
    (element.getAttribute("role") === "log" ? 8 : 0) +
    ((element.getAttribute("aria-live") || "") ? 5 : 0) +
    (/chat|message|conversation|support|help|ticket|thread/i.test(
      `${element.id} ${element.className} ${element.getAttribute("data-testid") || ""}`
    )
      ? 8
      : 0) +
    (/refund|charge|cancel|billing|support|agent|issue|ticket|replacement|credit/i.test(text)
      ? 6
      : 0)

  return signal + Math.min(text.length / 120, 10)
}

function getElementRect(element) {
  if (!(element instanceof HTMLElement)) {
    return null
  }

  const rect = element.getBoundingClientRect()
  if (!rect.width || !rect.height) {
    return null
  }

  return {
    x: Math.max(0, rect.left),
    y: Math.max(0, rect.top),
    width: rect.width,
    height: rect.height
  }
}

function findBestTranscriptElement() {
  const selectors = [
    '[role="log"]',
    '[aria-live="polite"]',
    '[aria-live="assertive"]',
    '[class*="chat"]',
    '[class*="message"]',
    '[class*="conversation"]',
    '[class*="support"]',
    '[class*="thread"]',
    '[id*="chat"]',
    '[id*="message"]',
    '[id*="support"]',
    '[id*="conversation"]'
  ]

  const seen = new Set()
  const candidates = []

  selectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((node) => {
      if (seen.has(node)) return
      seen.add(node)
      candidates.push(node)
    })
  })

  let best = null
  let bestScore = -1

  candidates.forEach((candidate) => {
    const score = scoreElement(candidate)
    if (score > bestScore) {
      bestScore = score
      best = candidate
    }
  })

  return best
}

function findBestProviderFrame() {
  const frames = Array.from(document.querySelectorAll("iframe"))
    .filter((frame) => isVisible(frame))
    .map((frame) => {
      const idAndClass = `${frame.id} ${frame.className} ${frame.name || ""} ${frame.src || ""}`.toLowerCase()
      let score = 0
      if (/intercom|zendesk|zopim|helpscout|beacon|gorgias|tawk/.test(idAndClass)) {
        score += 10
      }
      if (/chat|support|message|conversation|widget/.test(idAndClass)) {
        score += 6
      }

      const rect = frame.getBoundingClientRect()
      if (rect.width > 260 && rect.height > 220) {
        score += 4
      }
      if (rect.width >= 300 && rect.height >= 260 && rect.right >= window.innerWidth - 80) {
        score += 8
      }
      if (rect.bottom >= window.innerHeight - 40) {
        score += 3
      }
      if ((frame.getAttribute("src") || "").toLowerCase() === "about:blank") {
        score += 2
      }
      if (rect.width <= 90 && rect.height <= 90 && rect.right >= window.innerWidth - 10) {
        score -= 8
      }

      return { frame, score }
    })

  frames.sort((a, b) => b.score - a.score)
  return frames[0]?.score > 0 ? frames[0].frame : null
}

function extractTranscript(element) {
  if (!element) {
    return ""
  }

  const lineSelectors = [
    '[data-message-author-role]',
    '[class*="message"]',
    '[class*="bubble"]',
    '[class*="line"]',
    "article",
    "li",
    "p",
    "div"
  ]

  const lines = []
  const seen = new Set()

  lineSelectors.forEach((selector) => {
    element.querySelectorAll(selector).forEach((node) => {
      if (!(node instanceof HTMLElement) || !isVisible(node)) {
        return
      }

      const text = normalizeText(node.innerText || "")
      if (text.length < 16 || seen.has(text)) {
        return
      }

      seen.add(text)
      lines.push(text)
    })
  })

  if (!lines.length) {
    return normalizeText(element.innerText || "")
  }

  return lines.slice(0, 24).join("\n")
}

function extractAttachments(element) {
  if (!element) {
    return []
  }

  const items = []
  const seen = new Set()

  element.querySelectorAll("img, a[href], [data-attachment], [class*='attachment']").forEach((node) => {
    if (!(node instanceof HTMLElement) || !isVisible(node)) {
      return
    }

    if (node instanceof HTMLImageElement) {
      const url = node.currentSrc || node.src
      if (!url || seen.has(url)) {
        return
      }

      seen.add(url)
      items.push({
        kind: "image",
        label: normalizeText(node.alt || node.getAttribute("aria-label") || "Image attachment"),
        url
      })
      return
    }

    if (node instanceof HTMLAnchorElement) {
      const url = node.href
      if (!url || seen.has(url)) {
        return
      }

      const label = normalizeText(node.innerText || node.getAttribute("aria-label") || node.download || "")
      if (!label && !/\.(png|jpe?g|gif|webp|pdf|docx?|xlsx?|zip)$/i.test(url)) {
        return
      }

      seen.add(url)
      items.push({
        kind: /\.(png|jpe?g|gif|webp|svg)$/i.test(url) ? "image-link" : "file",
        label: label || url.split("/").pop() || "Attachment",
        url
      })
    }
  })

  return items.slice(0, 8)
}

function findRegexMatch(pattern, value) {
  const match = value.match(pattern)
  return match ? (match[1] || match[0]) : ""
}

function findPromisedOutcome(transcript) {
  const sentences = transcript
    .split(/\n|(?<=[.!?])\s+/)
    .map((part) => normalizeText(part))
    .filter(Boolean)

  return (
    sentences.find((sentence) =>
      /refund|replace|replacement|credit|escalat|follow up|resolve|cancel|downgrade|waive|reimburse|review/i.test(
        sentence
      )
    ) || ""
  )
}

function detectProvider() {
  let best = { id: "", name: "", score: 0 }

  PROVIDERS.forEach((provider) => {
    let score = 0

    provider.selectors.forEach((selector) => {
      try {
        if (document.querySelector(selector)) {
          score += 3
        }
      } catch {
        score += 0
      }
    })

    document.querySelectorAll("script[src], iframe[src], iframe[name]").forEach((node) => {
      const haystack = `${node.getAttribute("src") || ""} ${node.getAttribute("name") || ""}`.toLowerCase()
      if (haystack.includes(provider.id)) {
        score += 4
      }
      if (provider.id === "zendesk" && /zopim|zdassets/.test(haystack)) {
        score += 4
      }
      if (provider.id === "helpscout" && /beacon-v2|helpscout/.test(haystack)) {
        score += 4
      }
    })

    if (score > best.score) {
      best = { id: provider.id, name: provider.name, score }
    }
  })

  return best
}

function countSupportSignals(text) {
  const matches = text.match(
    /refund|support|billing|charge|replacement|agent|ticket|case|order|help|chat|representative|escalation/gi
  )
  return matches ? matches.length : 0
}

function getIssueTitleGuess() {
  const heading =
    document.querySelector("main h1, h1, [role='main'] h1, main h2, [role='main'] h2")?.textContent || ""
  const cleanHeading = normalizeText(heading)

  if (cleanHeading && cleanHeading.length > 8 && cleanHeading.length < 140) {
    return cleanHeading
  }

  return ""
}

function getPageContext() {
  const selection = window.getSelection ? normalizeText(window.getSelection().toString()) : ""
  const transcriptElement = findBestTranscriptElement()
  const providerFrame = findBestProviderFrame()
  const transcript = extractTranscript(transcriptElement)
  const transcriptRect = getElementRect(transcriptElement)
  const frameRect = getElementRect(providerFrame)
  const bodyText = normalizeText(document.body?.innerText || "")
  const fullText = [selection, transcript, bodyText].filter(Boolean).join("\n")
  const provider = detectProvider()
  const supportSignals = countSupportSignals(fullText)
  const supportSurface =
    transcript.length > 40 ? "transcript" : provider.score >= 4 || supportSignals >= 5 ? "widget" : "weak"
  const proofTargetRect = transcriptRect || frameRect || null
  const attachments = extractAttachments(transcriptElement || providerFrame)

  return {
    title: document.title || "",
    url: window.location.href,
    selection,
    transcript,
    transcriptRect,
    proofTargetRect,
    attachments,
    provider: provider.score ? provider : { id: "generic", name: "Generic support widget", score: 0 },
    supportSurface,
    issueTitleGuess: getIssueTitleGuess(),
    companyGuess: window.location.hostname.replace(/^www\./, "").split(".")[0] || "",
    caseId: findRegexMatch(
      /\b(?:case|ticket|order|ref|reference)[\s#:.-]*([A-Z0-9-]{3,})\b/i,
      fullText
    ) || findRegexMatch(/\b#([A-Z0-9-]{4,})\b/i, fullText),
    amount: findRegexMatch(/\$\s?\d[\d,]*(?:\.\d{2})?/i, fullText),
    promisedOutcome: findPromisedOutcome(fullText)
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "spv:getPageContext") {
    sendResponse(getPageContext())
  }
})
