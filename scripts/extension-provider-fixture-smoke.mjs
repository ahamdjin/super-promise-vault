import http from "node:http"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, "..")
const extensionPath = path.join(projectRoot, "extension")

const fixtures = [
  ["zendesk", "Zendesk", '<script src="https://static.zdassets.com/ekr/snippet.js"></script>'],
  ["intercom", "Intercom", '<script src="https://widget.intercom.io/widget/test"></script>'],
  ["helpscout", "Help Scout", '<script src="https://beacon-v2.helpscout.net/"></script>'],
  ["gorgias", "Gorgias", '<iframe src="https://chat.gorgias.io/widget"></iframe>'],
  ["crisp", "Crisp", '<script src="https://client.crisp.chat/l.js"></script>'],
  ["drift", "Drift", '<script src="https://js.driftt.com/include/test.js"></script>'],
  ["freshchat", "Freshchat", '<iframe id="fc_frame" src="https://wchat.freshchat.com/widget"></iframe>'],
  ["livechat", "LiveChat", '<script src="https://cdn.livechatinc.com/tracking.js"></script>'],
  ["hubspot", "HubSpot Chat", '<script src="https://js.hs-scripts.com/123.js"></script>'],
  ["userlike", "Userlike", '<script src="https://userlike-cdn-widgets.s3-eu-west-1.amazonaws.com/widget.js"></script>'],
  ["olark", "Olark", '<script src="https://static.olark.com/jsclient/loader.js"></script>'],
  ["facebook", "Meta Messenger", '<div class="fb_customer_chat"></div><script src="https://connect.facebook.net/en_US/sdk/xfbml.customerchat.js"></script>'],
  ["custom", "Custom chat widget", '<div data-chat-widget="true" data-testid="chat-message-list"></div>']
]

function renderFixture([id, name, providerMarkup]) {
  return `<!doctype html>
    <html>
      <head><title>${name} fixture</title></head>
      <body>
        ${providerMarkup}
        <main>
          <h1>${name} support thread</h1>
          <section role="log" class="support-chat transcript" data-testid="conversation-message-list">
            <article class="message bubble">Customer: I was charged twice for order CASE-${id.toUpperCase()}.</article>
            <article class="message bubble">Support: We will refund $42.00 and follow up tomorrow.</article>
            <a class="attachment" href="/proof-${id}.pdf">proof-${id}.pdf</a>
          </section>
        </main>
      </body>
    </html>`
}

async function listen(server) {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve))
  const address = server.address()
  return `http://127.0.0.1:${address.port}`
}

async function waitForExtensionWorker(context) {
  const existing = context.serviceWorkers()[0]
  if (existing) return existing
  return context.waitForEvent("serviceworker", { timeout: 15000 })
}

async function scanFixture(worker, url) {
  return worker.evaluate(async (targetUrl) => {
    const tabs = await chrome.tabs.query({ url: `${targetUrl}*` })
    const tab = tabs[0]
    if (!tab?.id) return { ok: false, error: "fixture tab not found" }

    const context = await chrome.tabs.sendMessage(tab.id, { type: "spv:getPageContext" }, { frameId: 0 })
    const capture = await chrome.tabs.sendMessage(tab.id, { type: "spv:runFullCapture" }, { frameId: 0 })

    return {
      ok: true,
      provider: context?.provider,
      supportSurface: context?.supportSurface,
      transcriptLength: (context?.transcript || "").length,
      attachmentCount: context?.attachments?.length || 0,
      fullCaptureStatus: capture?.status,
      fullCaptureLength: (capture?.stitchedText || "").length
    }
  }, url)
}

async function main() {
  const server = http.createServer((request, response) => {
    const providerId = request.url?.replace(/^\/+/, "").split(/[?#]/)[0] || "zendesk"
    const fixture = fixtures.find(([id]) => id === providerId)

    if (!fixture) {
      response.writeHead(404)
      response.end("Not found")
      return
    }

    response.writeHead(200, { "content-type": "text/html; charset=utf-8" })
    response.end(renderFixture(fixture))
  })

  const origin = await listen(server)
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "spv-provider-smoke-"))
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
    const results = []

    for (const fixture of fixtures) {
      const [id, expectedName] = fixture
      const page = await context.newPage()
      const url = `${origin}/${id}`
      await page.goto(url, { waitUntil: "domcontentloaded" })
      await page.waitForTimeout(400)
      const result = await scanFixture(worker, url)
      await page.close()
      results.push({ id, expectedName, ...result })
    }

    console.log(JSON.stringify({ ok: true, results }, null, 2))

    const failures = results.filter(
      (result) =>
        !result.ok ||
        result.provider?.name !== result.expectedName ||
        result.supportSurface !== "transcript" ||
        result.attachmentCount < 1 ||
        result.fullCaptureStatus !== "completed"
    )

    if (failures.length) {
      console.error(JSON.stringify({ failures }, null, 2))
      process.exitCode = 1
    }
  } finally {
    await context.close()
    fs.rmSync(userDataDir, { recursive: true, force: true })
    await new Promise((resolve) => server.close(resolve))
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
