// Fills the {{tokens}} in a workshop prompt. Returns segments: plain text,
// the visitor's own value ('own') or the workshop's sample value ('sample'),
// so the page can highlight what was filled in.
export function makeFill(details) {
  return function fill(template, values) {
    return template.split(/(\{\{\w+\}\})/).filter(Boolean).map(part => {
      const match = /^\{\{(\w+)\}\}$/.exec(part)
      if (!match) return { text: part, kind: 'text' }
      const own = (values?.[match[1]] || '').trim()
      if (own) return { text: own, kind: 'own' }
      if (details.sample[match[1]]) return { text: details.sample[match[1]], kind: 'sample' }
      return { text: `[${match[1]}]`, kind: 'bracket' }
    })
  }
}
