# Support Promise Vault Extension Capture Research

Date: 2026-05-17

## Goal

Build a Chrome extension that can reliably:

- detect support/chat widgets
- capture the actual chat region, not the whole page
- preserve visible conversation text when accessible
- preserve visible attachments when accessible
- fall back to screenshot + OCR when the widget is locked inside an iframe

The product is not useful if it only saves a generic screenshot.

## What we verified live

We tested against a real public widget on `https://www.tawk.to/` using the live Codex Chrome connection.

What we found:

- the visible chat UI is rendered inside floating `about:blank` iframes with random IDs
- the large message panel and the small launcher bubble are separate frames
- the actual readable conversation text is not exposed on the top-level page DOM
- a generic page content script cannot reliably read the conversation text from this surface
- the chat region itself can still be detected geometrically and cropped correctly from a visible screenshot

This means:

- `DOM transcript extraction` works for some providers/pages
- `chat-only screenshot capture` is achievable more broadly
- `full text capture` for locked iframe widgets requires OCR or a provider-specific integration path

## Chrome extension facts we need to design around

### 1. Content scripts do not automatically reach all useful frames

Chrome supports:

- `all_frames`
- `match_about_blank`
- `match_origin_as_fallback`

These matter because many widget surfaces render in child frames, including `about:blank`, `data:`, or related frames.

Practical implication:

- our manifest should not stop at top-frame injection
- we should test whether injecting into matching child frames gives us more readable DOM on each provider

### 2. `captureVisibleTab()` is still the most practical proof fallback

Chrome’s `tabs.captureVisibleTab()` gives us the visible image of the current tab.

Practical implication:

- we should keep this as the universal fallback
- but crop it to the detected chat panel whenever possible

### 3. Offscreen documents are the clean MV3 place for image processing

Chrome’s `offscreen` API allows hidden extension documents with DOM access.

Practical implication:

- OCR should not live as a hack in the popup
- if we add OCR, the clean path is:
  - popup/content script gathers target metadata
  - screenshot is captured
  - offscreen document crops/processes image
  - OCR result is returned to the extension

## Provider-specific facts we should use

### Zendesk

Zendesk exposes a Web Widget API and chat-related events through the widget API surface.

Practical implication:

- Zendesk deserves a dedicated adapter
- we should detect `zE` / widget presence and see what can be read or triggered safely

### Intercom

Intercom has a JavaScript API for messenger behavior.

Practical implication:

- Intercom also deserves a dedicated adapter
- even if full transcript access is not available, provider detection and widget-state awareness can be better than pure guessing

## What is realistically achievable

### Achievable now

- strong provider detection
- chat-region screenshot cropping
- visible attachment link detection from readable DOM
- DOM transcript extraction when the page exposes it
- save everything into a structured case record

### Achievable next with more build work

- OCR on cropped chat screenshots
- provider-specific adapters for `Zendesk`, `Intercom`, `Help Scout`, `Gorgias`
- better frame targeting for floating support widgets
- extension -> app -> Supabase sync

### Not universally achievable with a normal content script

- guaranteed raw transcript extraction from every support widget
- guaranteed attachment extraction from every cross-origin iframe
- full hidden history capture if only part of the chat is visually rendered

## Production-ready strategy

We should stop thinking of this as one capture method.

We need a layered capture engine:

### Layer 1: provider detection

Identify whether the current page looks like:

- Zendesk
- Intercom
- Help Scout
- Gorgias
- tawk.to
- unknown/generic widget

### Layer 2: DOM extraction

If readable:

- transcript
- case/order/reference IDs
- visible amounts
- visible promise lines
- visible attachment URLs

### Layer 3: frame targeting

If a large floating chat iframe is present:

- crop screenshot to that frame
- prefer message panel over launcher bubble

### Layer 4: OCR fallback

If DOM extraction is weak:

- run OCR on the cropped chat image
- extract visible conversation lines
- extract possible attachment labels visible in the image

### Layer 5: structured case output

Persist:

- provider
- company
- page URL
- screenshot proof
- transcript text
- OCR transcript
- extracted fields
- attachments
- capture confidence

## Immediate engineering plan

### Phase 1

- keep improving frame targeting
- verify `all_frames` + `match_about_blank` + `match_origin_as_fallback`
- confirm whether content scripts can reach more of the widget surface

### Phase 2

- add OCR capability for cropped screenshots
- do not depend on whole-page OCR
- OCR only the detected chat region

### Phase 3

- add provider-specific adapters starting with:
  - Zendesk
  - Intercom
  - Help Scout
  - Gorgias

### Phase 4

- sync captures into the main app and Supabase
- build a review/edit queue for extracted cases

## Working loop

This project should run on this loop:

1. Research the exact blocker
2. Build the narrow fix
3. Test on a real live page in Chrome
4. Debug what failed
5. Fix the implementation
6. Re-test on the same real page
7. Research again only when the next blocker is structural
8. Repeat until the behavior is stable enough for production

## Current conclusion

The extension now has a valid direction, but it is not production ready yet.

The next non-negotiable capability is:

- cropped chat-region OCR

Without OCR, locked iframe widgets will always leave us with only partial capture quality.

## Sources

- Chrome content scripts and related frames:
  - https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts
  - https://developer.chrome.com/docs/extensions/reference/manifest/content-scripts
- Chrome screenshot capture:
  - https://developer.chrome.com/docs/extensions/reference/api/tabs
- Chrome offscreen documents:
  - https://developer.chrome.com/docs/extensions/reference/api/offscreen
- Intercom JavaScript API:
  - https://www.intercom.com/help/en/articles/172-the-intercom-javascript-api
- Zendesk Web Widget API:
  - https://developer.zendesk.com/api-reference/widget/introduction/
