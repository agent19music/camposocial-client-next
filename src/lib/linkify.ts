/**
 * Common TLDs for bare domain detection (without http://).
 * This list covers most common TLDs to avoid false positives like "file.txt"
 */
const COMMON_TLDS = [
  // Generic TLDs
  'com', 'net', 'org', 'io', 'co', 'edu', 'gov', 'mil',
  // Tech/startup TLDs
  'agency', 'app', 'dev', 'me', 'info', 'biz', 'xyz', 'tech', 'online', 'site',
  'store', 'shop', 'blog', 'cloud', 'ai', 'gg', 'tv', 'fm', 'ly', 'to', 'cc',
  // Country codes (popular ones)
  'us', 'uk', 'ca', 'de', 'fr', 'es', 'it', 'nl', 'au', 'nz', 'jp', 'kr', 'cn',
  'in', 'br', 'mx', 'ru', 'pl', 'se', 'no', 'fi', 'dk', 'be', 'at', 'ch', 'ie',
  'pt', 'cz', 'gr', 'hu', 'ro', 'bg', 'sk', 'hr', 'si', 'lt', 'lv', 'ee', 'ua',
  'za', 'ng', 'ke', 'gh', 'eg', 'ma', 'tz', 'ug', 'rw', 'et'
];

const TLDS_PATTERN = COMMON_TLDS.join('|');

/**
 * Match URLs:
 * 1. URLs with http/https prefix
 * 2. www. prefixed domains  
 * 3. Bare domains with common TLDs (e.g., uzskicorp.agency, example.com)
 */
const URL_REGEX = new RegExp(
  `(?:https?:\\/\\/[^\\s]+)|` +                                         // http(s):// URLs
  `(?:www\\.[a-zA-Z0-9][a-zA-Z0-9.-]*\\.(?:${TLDS_PATTERN})(?:\\/[^\\s]*)?)|` + // www. domains
  `(?:(?<![a-zA-Z0-9@.])[a-zA-Z0-9][a-zA-Z0-9-]*(?:\\.[a-zA-Z0-9][a-zA-Z0-9-]*)*\\.(?:${TLDS_PATTERN})(?:\\/[^\\s]*)?)`, // bare domains
  'gi'
);

const TRAILING_PUNCT = /[.,;:!?)]+$/

export interface LinkSegment {
  type: "text" | "link"
  value: string
  href?: string
}

/**
 * Trim trailing punctuation that is likely sentence-ending (not part of the URL).
 */
export function trimTrailingPunctuation(url: string): string {
  return url.replace(TRAILING_PUNCT, "")
}

/**
 * Ensure URL has a protocol for href usage
 */
export function ensureProtocol(url: string): string {
  if (/^https?:\/\//i.test(url)) {
    return url
  }
  return `https://${url}`
}

/**
 * Extract URLs from text (for preview fetching). Returns unique URLs with protocol ensured.
 */
export function extractUrls(text: string, max = 3): string[] {
  if (!text || typeof text !== "string") return []
  const seen = new Set<string>()
  const urls: string[] = []
  let m: RegExpExecArray | null
  const re = new RegExp(URL_REGEX.source, "gi")
  while ((m = re.exec(text)) !== null && urls.length < max) {
    const raw = m[0]
    const cleaned = trimTrailingPunctuation(raw)
    const withProtocol = ensureProtocol(cleaned)
    if (withProtocol && !seen.has(withProtocol)) {
      seen.add(withProtocol)
      urls.push(withProtocol)
    }
  }
  return urls
}

/**
 * Split content into segments (text and link) for rendering.
 * Display value shows the original URL text, href has the full protocol for navigation.
 */
export function linkifySegments(content: string): LinkSegment[] {
  if (!content || typeof content !== "string") return [{ type: "text", value: content || "" }]
  const segments: LinkSegment[] = []
  let lastIndex = 0
  let m: RegExpExecArray | null
  const re = new RegExp(URL_REGEX.source, "gi")
  while ((m = re.exec(content)) !== null) {
    const raw = m[0]
    const displayValue = trimTrailingPunctuation(raw)
    const href = ensureProtocol(displayValue)
    if (m.index > lastIndex) {
      segments.push({ type: "text", value: content.slice(lastIndex, m.index) })
    }
    segments.push({ type: "link", value: displayValue, href })
    lastIndex = m.index + raw.length
  }
  if (lastIndex < content.length) {
    segments.push({ type: "text", value: content.slice(lastIndex) })
  }
  return segments.length ? segments : [{ type: "text", value: content }]
}
