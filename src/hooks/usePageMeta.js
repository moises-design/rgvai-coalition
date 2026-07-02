import { useEffect } from 'react'

function setMeta(attr, key, content) {
  let el = document.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export default function usePageMeta({ title, description, ogTitle, ogDescription, path = '/' }) {
  useEffect(() => {
    const prevTitle = document.title
    document.title = title
    setMeta('name', 'description', description)
    setMeta('property', 'og:title', ogTitle || title)
    setMeta('property', 'og:description', ogDescription || description)
    setMeta('property', 'og:url', `https://rgvaicoalition.com${path}`)

    return () => {
      document.title = prevTitle
    }
  }, [title, description, ogTitle, ogDescription, path])
}
