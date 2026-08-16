"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"

interface AnnouncementBarProps {
  messages: string[]
}

export function AnnouncementBar({ messages }: AnnouncementBarProps) {
  const t = useTranslations("header.announcements")
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (messages.length <= 1) return
    const id = setInterval(() => setIndex((i) => (i + 1) % messages.length), 5000)
    return () => clearInterval(id)
  }, [messages.length])

  if (messages.length === 0) return null

  return (
    <div className="relative overflow-hidden bg-sangria py-3 text-center text-body font-medium text-white">
      <p key={index} className="mx-auto max-w-7xl animate-in fade-in px-4 duration-500 md:px-8">
        {messages[index]}
      </p>
      {messages.length > 1 && (
        <div className="mt-1.5 flex items-center justify-center gap-1.5">
          {messages.map((m, i) => (
            <button
              key={m}
              type="button"
              aria-label={t("goToMessage", { number: i + 1 })}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-4 bg-white" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
