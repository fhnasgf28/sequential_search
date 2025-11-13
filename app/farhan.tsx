"use client"
import React, { useEffect, useState } from "react"

type ScrapedNewsItem = {
  title: string
  snippet?: string
  url?: string
  image?: string
  category?: string
  date?: string
}

interface NewsCardProps {
  // bila dipanggil sebagai single-card, bisa pass news + searchQuery
  news?: ScrapedNewsItem
  searchQuery?: string
  // jika dipakai tanpa prop, komponen default akan fetch list dan render semua card
  asList?: boolean
}

function HighlightedText({ text, searchQuery }: { text: string; searchQuery?: string }) {
  if (!searchQuery || !searchQuery.trim()) return <>{text}</>

  const parts = text.split(new RegExp(`(${searchQuery})`, "gi"))
  return (
    <>
      {parts.map((part, idx) =>
        part.toLowerCase() === searchQuery.toLowerCase() ? (
          <mark key={idx} className="bg-cyan-500 text-white rounded px-1">
            {part}
          </mark>
        ) : (
          <span key={idx}>{part}</span>
        ),
      )}
    </>
  )
}

function Card({ news, searchQuery }: { news: ScrapedNewsItem; searchQuery?: string }) {
  return (
    <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 transition-all duration-300 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/20 hover:-translate-y-1 h-full flex flex-col">
      <div className="relative h-48 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 overflow-hidden">
      <img
          src={news.image || "/placeholder.svg"}
          alt={news.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full text-xs font-semibold text-white shadow-lg">
            {news.category || "Berita"}
          </span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <p className="text-slate-400 text-xs mb-3 uppercase tracking-wide">{news.date || ""}</p>
        <h3 className="font-bold text-lg text-white mb-3 line-clamp-2 group-hover:text-cyan-400 transition-colors">
          <HighlightedText text={news.title} searchQuery={searchQuery} />
        </h3>
        <p className="text-slate-400 text-sm line-clamp-2 flex-1">{news.snippet || ""}</p>

        <div className="flex items-center justify-end pt-4 mt-auto border-t border-slate-700">
          <a
            href={news.url || "#"}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/40 hover:to-cyan-500/40 border border-blue-500/30 rounded-lg text-xs font-medium text-cyan-400 transition-all duration-300"
          >
            Baca
          </a>
        </div>
      </div>
    </div>
  )
}

// Default export: fetch list dari /api/scrape-bola dan render grid
export default function NewsCard({ news, searchQuery = "", asList = true }: NewsCardProps) {
  const [items, setItems] = useState<ScrapedNewsItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cache config
  const CACHE_KEY = "scrapeBolaCacheV1"
  const CACHE_TTL_MS = 1000 * 60 * 30 // 30 minutes; ubah sesuai kebutuhan
  const MAX_DISPLAY = 4 // batasi jumlah card yang ditampilkan (3 baris x 4 kolom)

  useEffect(() => {
    if (!asList) return
    let mounted = true
    setLoading(true)

    try {
      const raw = localStorage.getItem(CACHE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as { ts: number; data: ScrapedNewsItem[] }
        const age = Date.now() - (parsed.ts || 0)
        if (age < CACHE_TTL_MS && parsed.data && parsed.data.length) {
          // gunakan cache yang valid
          if (mounted) {
            setItems(parsed.data.slice(0, MAX_DISPLAY))
            setLoading(false)
          }
          return () => {
            mounted = false
          }
        }
      }
    } catch (e) {
      // gagal parse cache -> lanjut fetch
      console.warn("news-card: gagal membaca cache, akan fetch ulang", e)
    }

    // fetch kalau nggak ada cache atau cache expired
    fetch("/api/scrape-bola")
      .then((r) => {
        if (!r.ok) throw new Error(`status ${r.status}`)
        return r.json()
      })
      .then((data: ScrapedNewsItem[]) => {
        if (!mounted) return
        const normalized = (data || []).map((d) => ({
          title: d.title || "",
          snippet: d.snippet || "",
          url: d.url,
          image: d.image,
          category: d.category,
          date: d.date,
        }))
        const sliced = normalized.slice(0, MAX_DISPLAY)
        setItems(sliced)
        try {
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
              ts: Date.now(),
              data: normalized,
            }),
          )
        } catch (e) {
          console.warn("news-card: gagal menyimpan cache", e)
        }
      })
      .catch((err) => {
        console.error("fetch scrape-bola error:", err)
        if (mounted) setError("Gagal mengambil data")
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asList])

  // jika dipanggil sebagai single card (asList = false dan props news ada), render 1 card
  if (!asList && news) {
    return <Card news={news} searchQuery={searchQuery} />
  }

  // Hitung jumlah berita & kategori unik
  const totalBerita = items.length
  const kategoriSet = new Set(items.map((it) => it.category).filter(Boolean))
  const totalKategori = kategoriSet.size

  // list mode
  return (
    <div className="w-full max-w-screen-xl mx-auto px-4">
      <div className="flex flex-wrap items-center justify-between mb-4">
        <div className="text-slate-300 text-sm">
          <span className="font-semibold text-cyan-400">{totalBerita}</span> berita &nbsp;
          <span className="font-semibold text-cyan-400">{totalKategori}</span> kategori
        </div>
      </div>
      {loading && <p className="text-slate-400">Memuat berita...</p>}
      {error && <p className="text-red-400">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
        {items.map((it, idx) => (
          <Card key={idx} news={it} searchQuery={searchQuery} />
        ))}
      </div>
    </div>
  )
}
