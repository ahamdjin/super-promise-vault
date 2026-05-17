(function bootstrapShared(global) {
  const existing = global.SPV || {}

  function createId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  }

  function isoNow() {
    return new Date().toISOString()
  }

  function cleanText(value) {
    return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : ""
  }

  global.SPV = {
    ...existing,
    createId,
    isoNow,
    cleanText
  }
})(globalThis)
