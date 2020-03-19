import config from '../tmp/config'
const MATCH_PARAM = RegExp(/\:[^\/\()]+/g)

export function handleScroll(element) {
  scrollAncestorsToTop(element)
  handleHash()
}

export function handleHash() {
  const { scroll } = config
  const options = ['auto', 'smooth']
  const { hash } = window.location
  if (scroll && hash) {
    const behavior = (options.includes(scroll) && scroll) || 'auto'
    const el = document.querySelector(hash)
    if (hash && el) el.scrollIntoView({ behavior })
  }
}

export function scrollAncestorsToTop(element) {
  if (
    element &&
    element.scrollTo &&
    element.dataset.routify !== 'scroll-lock'
  ) {
    element.scrollTo(0, 0)
    scrollAncestorsToTop(element.parentElement)
  }
}

export const pathToRegex = (str, recursive) => {
  const { baseUrl, spaEntry } = config
  const suffix = recursive ? '' : '/?$' //fallbacks should match recursively
  str = str.replace(/\/_fallback?$/, '(/|$)')
  str = str.replace(/\/index$/, '(/index)?') //index files should be matched even if not present in url
  str = '^' + baseUrl + spaEntry + str.replace(MATCH_PARAM, '([^/]+)') + suffix
  return str
}

export const pathToParams = string => {
  const matches = string.match(MATCH_PARAM)
  if (matches) return matches.map(str => str.substr(1, str.length - 2))
}

export const pathToRank = ({ path }) => {
  return path
    .split('/')
    .filter(Boolean)
    .map(str => (str === '_fallback' ? 'A' : str.startsWith(':') ? 'B' : 'C'))
    .join('')
}

let warningSuppressed = false

/* eslint no-console: 0 */
export function suppressWarnings() {
  if (warningSuppressed) return
  const consoleWarn = console.warn
  console.warn = function(msg, ...msgs) {
    const ignores = [
      "was created with unknown prop 'scoped'",
      "was created with unknown prop 'scopedSync'",
    ]
    if (!ignores.find(iMsg => msg.includes(iMsg)))
      return consoleWarn(msg, ...msgs)
  }
  warningSuppressed = true
}
