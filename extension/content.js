function isVisible(element) {
  if (!(element instanceof HTMLElement)) {
    return false;
  }

  const style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden") {
    return false;
  }

  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function normalizeText(value) {
  return value.replace(/\s+/g, " ").trim();
}

function scoreElement(element) {
  const text = normalizeText(element.innerText || "");
  if (text.length < 40 || !isVisible(element)) {
    return -1;
  }

  const signal =
    (element.getAttribute("role") === "log" ? 8 : 0) +
    ((element.getAttribute("aria-live") || "") ? 5 : 0) +
    (/chat|message|conversation|support|help|ticket/i.test(
      `${element.id} ${element.className} ${element.getAttribute("data-testid") || ""}`
    )
      ? 8
      : 0) +
    (/refund|charge|cancel|billing|support|agent|issue|ticket|replacement|credit/i.test(text)
      ? 6
      : 0);

  return signal + Math.min(text.length / 120, 10);
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
    '[id*="chat"]',
    '[id*="message"]',
    '[id*="support"]'
  ];

  const seen = new Set();
  const candidates = [];

  selectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((node) => {
      if (seen.has(node)) return;
      seen.add(node);
      candidates.push(node);
    });
  });

  let best = null;
  let bestScore = -1;

  candidates.forEach((candidate) => {
    const score = scoreElement(candidate);
    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  });

  return best;
}

function extractTranscript(element) {
  if (!element) {
    return "";
  }

  const lineSelectors = [
    '[data-message-author-role]',
    '[class*="message"]',
    '[class*="bubble"]',
    "article",
    "li",
    "p",
    "div"
  ];

  const lines = [];
  const seen = new Set();

  lineSelectors.forEach((selector) => {
    element.querySelectorAll(selector).forEach((node) => {
      if (!(node instanceof HTMLElement) || !isVisible(node)) {
        return;
      }

      const text = normalizeText(node.innerText || "");
      if (text.length < 16 || seen.has(text)) {
        return;
      }

      seen.add(text);
      lines.push(text);
    });
  });

  if (!lines.length) {
    return normalizeText(element.innerText || "");
  }

  return lines.slice(0, 24).join("\n");
}

function findRegexMatch(pattern, value) {
  const match = value.match(pattern);
  return match ? match[0] : "";
}

function findPromisedOutcome(transcript) {
  const sentences = transcript
    .split(/\n|(?<=[.!?])\s+/)
    .map((part) => normalizeText(part))
    .filter(Boolean);

  return (
    sentences.find((sentence) =>
      /refund|replace|replacement|credit|escalat|follow up|resolve|cancel|downgrade|waive/i.test(
        sentence
      )
    ) || ""
  );
}

function getPageContext() {
  const selection = window.getSelection ? normalizeText(window.getSelection().toString()) : "";
  const transcriptElement = findBestTranscriptElement();
  const transcript = extractTranscript(transcriptElement);
  const fullText = [selection, transcript, normalizeText(document.body?.innerText || "")]
    .filter(Boolean)
    .join("\n");

  return {
    title: document.title || "",
    url: window.location.href,
    selection,
    transcript,
    companyGuess: window.location.hostname.replace(/^www\./, "").split(".")[0] || "",
    caseId: findRegexMatch(
      /\b(?:case|ticket|order|ref|reference)[\s#:.-]*[A-Z0-9-]{3,}\b/i,
      fullText
    ),
    amount: findRegexMatch(/\$\s?\d[\d,]*(?:\.\d{2})?/i, fullText),
    promisedOutcome: findPromisedOutcome(fullText)
  };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "spv:getPageContext") {
    sendResponse(getPageContext());
  }
});
