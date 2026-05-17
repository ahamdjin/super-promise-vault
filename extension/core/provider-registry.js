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
      selectors: [
        '[class*="chat"]',
        '[class*="message"]',
        '[class*="support"]',
        '[id*="chat"]',
        '[id*="message"]',
        '[role="log"]'
      ],
      patterns: [/chat|support|message|conversation|widget/i],
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
      selectors: ['iframe[src*="tawk.to"]', 'script[src*="tawk.to"]', '[class*="tawk"]', '[id*="tawk"]'],
      patterns: [/tawk\.to|tawk_/i],
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
      selectors: [
        'iframe[src*="zendesk"]',
        'iframe[src*="zopim"]',
        'script[src*="zendesk"]',
        'script[src*="zopim"]',
        '[id*="launcher"]',
        '[class*="zEWidget"]'
      ],
      patterns: [/zendesk|zopim|zdassets|web_widget|ze-snippet/i],
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
      selectors: [
        'iframe[src*="intercom"]',
        'script[src*="intercom"]',
        '[class*="intercom"]',
        '[id*="intercom"]'
      ],
      patterns: [/intercom|intercomcdn|intercom-messenger/i],
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
      selectors: [
        'iframe[src*="helpscout"]',
        'script[src*="helpscout"]',
        'script[src*="beacon"]',
        '[class*="Beacon"]',
        '[id*="beacon"]'
      ],
      patterns: [/helpscout|beacon-v2|beacon/i],
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
      selectors: [
        'iframe[src*="gorgias"]',
        'script[src*="gorgias"]',
        '[class*="gorgias"]',
        '[id*="gorgias"]'
      ],
      patterns: [/gorgias|gorgias-chat/i],
      capabilities: {
        canReadDom: true,
        canCollectAttachments: true,
        needsOcrFallback: true,
        supportsFullThreadScroll: true
      }
    },
    {
      id: "crisp",
      name: "Crisp",
      selectors: [
        'iframe[src*="crisp.chat"]',
        'script[src*="crisp.chat"]',
        '[class*="crisp"]',
        '[id*="crisp"]'
      ],
      patterns: [/crisp\.chat|crisp-client|crisp/i],
      capabilities: {
        canReadDom: true,
        canCollectAttachments: true,
        needsOcrFallback: true,
        supportsFullThreadScroll: true
      }
    },
    {
      id: "drift",
      name: "Drift",
      selectors: [
        'iframe[src*="drift.com"]',
        'script[src*="drift.com"]',
        '[class*="drift"]',
        '[id*="drift"]'
      ],
      patterns: [/drift\.com|driftt|drift-widget/i],
      capabilities: {
        canReadDom: true,
        canCollectAttachments: true,
        needsOcrFallback: true,
        supportsFullThreadScroll: true
      }
    },
    {
      id: "freshchat",
      name: "Freshchat",
      selectors: [
        'iframe[src*="freshchat"]',
        'iframe[src*="freshworks"]',
        'script[src*="freshchat"]',
        'script[src*="freshworks"]',
        '[class*="freshchat"]',
        '[id*="fc_frame"]'
      ],
      patterns: [/freshchat|freshworks|fc_frame|freshdesk/i],
      capabilities: {
        canReadDom: true,
        canCollectAttachments: true,
        needsOcrFallback: true,
        supportsFullThreadScroll: true
      }
    },
    {
      id: "livechat",
      name: "LiveChat",
      selectors: [
        'iframe[src*="livechatinc.com"]',
        'iframe[src*="livechat.com"]',
        'script[src*="livechatinc.com"]',
        'script[src*="livechat.com"]',
        '[class*="livechat"]',
        '[id*="livechat"]'
      ],
      patterns: [/livechatinc|livechat\.com|lc_chat/i],
      capabilities: {
        canReadDom: true,
        canCollectAttachments: true,
        needsOcrFallback: true,
        supportsFullThreadScroll: true
      }
    },
    {
      id: "hubspot",
      name: "HubSpot Chat",
      selectors: [
        'iframe[src*="hubspot"]',
        'iframe[src*="hs-scripts"]',
        'script[src*="hubspot"]',
        'script[src*="hs-scripts"]',
        '[class*="hubspot"]',
        '[id*="hubspot"]'
      ],
      patterns: [/hubspot|hs-scripts|hubspot-messages|HubSpotConversations/i],
      capabilities: {
        canReadDom: true,
        canCollectAttachments: true,
        needsOcrFallback: true,
        supportsFullThreadScroll: true
      }
    },
    {
      id: "userlike",
      name: "Userlike",
      selectors: [
        'iframe[src*="userlike"]',
        'script[src*="userlike"]',
        '[class*="userlike"]',
        '[id*="userlike"]'
      ],
      patterns: [/userlike|userlike-cdn/i],
      capabilities: {
        canReadDom: true,
        canCollectAttachments: true,
        needsOcrFallback: true,
        supportsFullThreadScroll: true
      }
    },
    {
      id: "olark",
      name: "Olark",
      selectors: [
        'iframe[src*="olark"]',
        'script[src*="olark"]',
        '[class*="olark"]',
        '[id*="olark"]'
      ],
      patterns: [/olark|habla_window/i],
      capabilities: {
        canReadDom: true,
        canCollectAttachments: true,
        needsOcrFallback: true,
        supportsFullThreadScroll: true
      }
    },
    {
      id: "facebook",
      name: "Meta Messenger",
      selectors: [
        'iframe[src*="facebook.com"]',
        'iframe[src*="messenger"]',
        'script[src*="connect.facebook.net"]',
        '[class*="fb_customer_chat"]'
      ],
      patterns: [/fb_customer_chat|connect\.facebook\.net|messenger/i],
      capabilities: {
        canReadDom: false,
        canCollectAttachments: false,
        needsOcrFallback: true,
        supportsFullThreadScroll: false
      }
    },
    {
      id: "custom",
      name: "Custom chat widget",
      selectors: [
        '[data-chat-widget]',
        '[data-support-widget]',
        '[data-testid*="chat"]',
        '[data-testid*="conversation"]',
        '[data-testid*="message"]'
      ],
      patterns: [/data-chat-widget|support-widget/i],
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
