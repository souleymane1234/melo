import { useEffect, useRef, useState } from 'react'

export function useRevealOnView<T extends HTMLElement = HTMLElement>(
  options?: IntersectionObserverInit,
) {
  const ref = useRef<T | null>(null)
  const [isVisible, setIsVisible] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const optionsRef = useRef(options)

  useEffect(() => {
    const el = ref.current
    if (!el || isVisible) return

    const ob = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          ob.disconnect()
        }
      },
      { rootMargin: '0px 0px -2% 0px', threshold: 0.01, ...optionsRef.current },
    )
    ob.observe(el)

    requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || document.documentElement.clientHeight
      if (rect.top < vh * 0.95 && rect.bottom > 0) {
        setIsVisible(true)
        ob.disconnect()
      }
    })

    const fallback = window.setTimeout(() => {
      setIsVisible(true)
      ob.disconnect()
    }, 900)

    return () => {
      ob.disconnect()
      window.clearTimeout(fallback)
    }
  }, [isVisible])

  return { ref, isVisible }
}
