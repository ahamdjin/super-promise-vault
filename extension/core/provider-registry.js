(function bootstrapProviderRegistry(global) {
  const registry = new Map()

  function registerProvider(provider) {
    registry.set(provider.id, provider)
  }

  function getProvider(id) {
    return registry.get(id) || registry.get("generic")
  }

  function listProviders() {
    return Array.from(registry.values())
  }

  function detectProviderAdapter(pageContext) {
    const providerId = pageContext?.provider?.id || "generic"
    return getProvider(providerId)
  }

  ;[
    {
      id: "generic",
      name: "Generic support widget",
      capabilities: {
        canReadDom: true,
        canCollectAttachments: true,
        needsOcrFallback: true,
        supportsFullThreadScroll: false
      }
    },
    {
      id: "tawk",
      name: "tawk.to",
      capabilities: {
        canReadDom: false,
        canCollectAttachments: false,
        needsOcrFallback: true,
        supportsFullThreadScroll: false
      }
    },
    {
      id: "zendesk",
      name: "Zendesk",
      capabilities: {
        canReadDom: true,
        canCollectAttachments: true,
        needsOcrFallback: true,
        supportsFullThreadScroll: true
      }
    },
    {
      id: "intercom",
      name: "Intercom",
      capabilities: {
        canReadDom: true,
        canCollectAttachments: true,
        needsOcrFallback: true,
        supportsFullThreadScroll: true
      }
    },
    {
      id: "helpscout",
      name: "Help Scout",
      capabilities: {
        canReadDom: true,
        canCollectAttachments: true,
        needsOcrFallback: true,
        supportsFullThreadScroll: true
      }
    },
    {
      id: "gorgias",
      name: "Gorgias",
      capabilities: {
        canReadDom: true,
        canCollectAttachments: true,
        needsOcrFallback: true,
        supportsFullThreadScroll: true
      }
    }
  ].forEach(registerProvider)

  global.SPV = {
    ...global.SPV,
    registerProvider,
    getProvider,
    listProviders,
    detectProviderAdapter
  }
})(globalThis)
