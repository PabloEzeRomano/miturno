'use client'
import { useEffect } from 'react'

const BLINK_MESSAGES = [
  '¿Todavía no tenés agenda online?',
  '→ Volvé a miturno',
]

export function TitleBlinker() {
  useEffect(() => {
    const original = document.title
    let interval: ReturnType<typeof setInterval> | null = null
    let idx = 0

    function onHide() {
      if (interval) return
      interval = setInterval(() => {
        document.title = BLINK_MESSAGES[idx % BLINK_MESSAGES.length]
        idx++
      }, 2000)
    }

    function onShow() {
      if (interval) {
        clearInterval(interval)
        interval = null
      }
      idx = 0
      document.title = original
    }

    function onVisibility() {
      if (document.hidden) onHide()
      else onShow()
    }

    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      if (interval) clearInterval(interval)
    }
  }, [])

  return null
}
