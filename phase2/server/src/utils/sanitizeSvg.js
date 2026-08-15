const BLOCKED_TAGS = /<\/?\s*(script|foreignObject|iframe|object|embed|audio|video|iframe|use)\b[^>]*>/gi
const EVENT_ATTRIBUTES = /\s+on[a-z0-9_-]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi
const JAVASCRIPT_URLS = /\s+(?:href|xlink:href|src)\s*=\s*(?:"|')\s*javascript:[^"']*(?:"|')/gi
const EXTERNAL_URLS = /\s+(?:href|xlink:href)\s*=\s*(?:"|')\s*(?:https?:|data:text\/html|file:)[^"']*(?:"|')/gi
const IMPORTS = /@import\s+[^;]+;?/gi
const EXTERNAL_CSS_URLS = /url\(\s*(['\"]?)(?!#)[^)]*\1\s*\)/gi
const DOCTYPE = /<!DOCTYPE[^>]*>/gi

export function sanitizeSvg(svg) {
  let output = String(svg || '').replace(/^\uFEFF/, '')
  if (!/<svg\b/i.test(output)) throw new Error('The uploaded file is not a valid SVG document.')

  output = output
    .replace(BLOCKED_TAGS, '')
    .replace(EVENT_ATTRIBUTES, '')
    .replace(JAVASCRIPT_URLS, '')
    .replace(EXTERNAL_URLS, '')
    .replace(IMPORTS, '')
    .replace(EXTERNAL_CSS_URLS, '')
    .replace(DOCTYPE, '')

  // Keep the SVG self-contained. External stylesheets can otherwise make the asset non-deterministic.
  output = output.replace(/<link\b[^>]*>/gi, '')
  return output
}
