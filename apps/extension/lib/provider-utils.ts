import type { DetectionResult, ProviderName, SupportTier } from '@/lib/types';

type MatchScore = {
  provider: ProviderName;
  score: number;
  tier: SupportTier;
  detectedVia: string[];
};

const PROVIDER_RULES: Array<{
  provider: ProviderName;
  tier: SupportTier;
  scriptMatches: string[];
  iframeMatches: string[];
  domMatches: string[];
}> = [
  {
    provider: 'zendesk',
    tier: 'structured',
    scriptMatches: ['zdassets.com/ekr/snippet.js', 'static.zdassets.com'],
    iframeMatches: ['zendesk.com', 'zdassets.com', 'zopim.com'],
    domMatches: ['[id*="launcher"]', '[data-testid*="launcher"]', '[class*="zEWidget"]'],
  },
  {
    provider: 'intercom',
    tier: 'structured',
    scriptMatches: ['widget.intercom.io', 'js.intercomcdn.com'],
    iframeMatches: ['intercom', 'intercomcdn.com'],
    domMatches: ['iframe[name^="intercom"]', '[class*="intercom-"]', '[id*="intercom"]'],
  },
  {
    provider: 'helpscout',
    tier: 'fallback',
    scriptMatches: ['beacon-v2.helpscout.net', 'secure.helpscout.net'],
    iframeMatches: ['helpscout', 'beacon'],
    domMatches: ['[class*="Beacon"]', '[id*="beacon"]'],
  },
  {
    provider: 'gorgias',
    tier: 'fallback',
    scriptMatches: ['gorgias.chat', 'widget.gorgias.chat'],
    iframeMatches: ['gorgias'],
    domMatches: ['[id*="gorgias"]', '[class*="gorgias"]'],
  },
];

const uniq = (items: string[]) => Array.from(new Set(items));

function gatherDomEvidence(doc: Document) {
  const scripts = Array.from(doc.querySelectorAll('script[src]')).map(
    (node) => (node as HTMLScriptElement).src,
  );
  const iframes = Array.from(doc.querySelectorAll('iframe[src]')).map(
    (node) => (node as HTMLIFrameElement).src,
  );

  return { scripts, iframes };
}

export function detectProvider(doc: Document): DetectionResult {
  const matches: MatchScore[] = [];
  const { scripts, iframes } = gatherDomEvidence(doc);

  for (const rule of PROVIDER_RULES) {
    let score = 0;
    const detectedVia: string[] = [];

    for (const needle of rule.scriptMatches) {
      if (scripts.some((src) => src.includes(needle))) {
        score += 3;
        detectedVia.push(`script:${needle}`);
      }
    }

    for (const needle of rule.iframeMatches) {
      if (iframes.some((src) => src.includes(needle))) {
        score += 3;
        detectedVia.push(`iframe:${needle}`);
      }
    }

    for (const selector of rule.domMatches) {
      if (doc.querySelector(selector)) {
        score += 2;
        detectedVia.push(`dom:${selector}`);
      }
    }

    if (score > 0) {
      matches.push({
        provider: rule.provider,
        score,
        tier: rule.tier,
        detectedVia: uniq(detectedVia),
      });
    }
  }

  const best = matches.sort((a, b) => b.score - a.score)[0];
  const url = window.location.href;
  const title = doc.title || 'Untitled page';
  const domain = window.location.hostname;

  if (!best) {
    return {
      provider: 'unknown',
      tier: 'unsupported',
      url,
      title,
      domain,
      detectedVia: [],
      notes: ['No supported provider signature was detected on this page.'],
    };
  }

  return {
    provider: best.provider,
    tier: best.tier,
    url,
    title,
    domain,
    detectedVia: best.detectedVia,
    notes:
      best.tier === 'fallback'
        ? ['Provider detected. Expect screenshot fallback on some widget layouts.']
        : ['Provider detected. Structured extraction is likely available.'],
  };
}

export function guessCompanyName(domain: string) {
  const host = domain.replace(/^www\./, '');
  const root = host.split('.')[0] || host;
  return root
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
