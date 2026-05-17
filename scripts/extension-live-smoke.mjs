import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"
import sharp from "sharp"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, "..")
const extensionPath = path.join(projectRoot, "extension")
const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "spv-extension-smoke-"))

async function createOcrFixture() {
  const svg = Buffer.from(`
    <svg width="900" height="260" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="white"/>
      <text x="48" y="92" font-family="Arial" font-size="42" fill="black">Support agent promised refund by Friday</text>
      <text x="48" y="162" font-family="Arial" font-size="34" fill="black">Attachment invoice.pdf uploaded</text>
    </svg>
  `)
  const png = await sharp(svg).png().toBuffer()
  return `data:image/png;base64,${png.toString("base64")}`
}

async function waitForExtensionWorker(context) {
  let [worker] = context.serviceWorkers()
  if (worker) {
    return worker
  }

  worker = await context.waitForEvent("serviceworker", { timeout: 15000 })
  return worker
}

async function main() {
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    ignoreDefaultArgs: ["--disable-extensions", "--disable-component-extensions-with-background-pages"],
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      "--no-first-run",
      "--no-default-browser-check"
    ]
  })

  try {
    const worker = await waitForExtensionWorker(context)
    const extensionId = new URL(worker.url()).host
    const page = await context.newPage()
    await page.goto("https://www.tawk.to/", { waitUntil: "domcontentloaded", timeout: 45000 })
    await page.waitForTimeout(8000)

    const frameScan = await worker.evaluate(async () => {
      const tabs = await chrome.tabs.query({ url: "https://www.tawk.to/*" })
      const tab = tabs[0]
      if (!tab?.id) {
        return { ok: false, error: "No tawk.to tab found." }
      }

      const frames = (await chrome.webNavigation.getAllFrames({ tabId: tab.id })) || []
      const responses = []

      for (const frame of frames) {
        try {
          const response = await chrome.tabs.sendMessage(
            tab.id,
            { type: "spv:getPageContext" },
            { frameId: frame.frameId }
          )
          responses.push({
            frameId: frame.frameId,
            frameUrl: frame.url,
            provider: response?.provider?.name || "",
            supportSurface: response?.supportSurface || "",
            transcriptLength: (response?.transcript || "").length,
            hasProofTarget: Boolean(response?.proofTargetRect),
            attachmentCount: response?.attachments?.length || 0
          })
        } catch (error) {
          responses.push({
            frameId: frame.frameId,
            frameUrl: frame.url,
            error: error?.message || "No response"
          })
        }
      }

      return { ok: true, frameCount: frames.length, responses }
    })

    const fullCapture = await worker.evaluate(async () => {
      const tabs = await chrome.tabs.query({ url: "https://www.tawk.to/*" })
      const tab = tabs[0]
      if (!tab?.id) {
        return { ok: false, error: "No tawk.to tab found." }
      }

      const frames = (await chrome.webNavigation.getAllFrames({ tabId: tab.id })) || []
      const responses = []

      for (const frame of frames) {
        try {
          const response = await chrome.tabs.sendMessage(
            tab.id,
            { type: "spv:runFullCapture" },
            { frameId: frame.frameId }
          )
          responses.push({
            frameId: frame.frameId,
            frameUrl: frame.url,
            status: response?.status || "",
            reason: response?.reason || "",
            chunkCount: response?.chunks?.length || 0,
            stitchedLength: (response?.stitchedText || "").length,
            attachmentCount: response?.attachments?.length || 0
          })
        } catch (error) {
          responses.push({
            frameId: frame.frameId,
            frameUrl: frame.url,
            error: error?.message || "No response"
          })
        }
      }

      const best = [...responses].sort((a, b) => (b.stitchedLength || 0) - (a.stitchedLength || 0))[0]
      return { ok: true, responses, best }
    })

    const ocrImage = await createOcrFixture()
    const ocrResult = await worker.evaluate(async (imageDataUrl) => {
      await ensureOffscreenDocument()
      return sendToOffscreen({
        target: "spv-offscreen",
        type: "spv:recognizeImage",
        requestId: "smoke-test",
        imageDataUrl
      })
    }, ocrImage)

    console.log(
      JSON.stringify(
        {
          ok: true,
          extensionId,
          frameScan,
          fullCapture,
          ocr: {
            ok: ocrResult?.ok,
            confidence: ocrResult?.confidence,
            text: ocrResult?.text
          }
        },
        null,
        2
      )
    )

    if (!frameScan.ok || !fullCapture.ok || !ocrResult?.ok || !/refund/i.test(ocrResult.text || "")) {
      process.exitCode = 1
    }
  } finally {
    await context.close()
    fs.rmSync(userDataDir, { recursive: true, force: true })
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
