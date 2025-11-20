import type { NewsItem } from "@/lib/mock-data"
import { Heart } from "lucide-react"

interface NewsCardProps {
  news: {
    id: number
    title: string
    category: string
    date: string
    excerpt: string
    image: string
    url?: string
  }
  searchQuery: string
  isBeingChecked?: boolean
  isBookmarked?: boolean
  onToggleBookmark?: (id: number) => void
  onClick?: () => void
}

export default function NewsCard({ news, searchQuery, isBeingChecked, isBookmarked, onToggleBookmark, onClick }: NewsCardProps) {
  // Highlight text logic
  const getHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text
    const parts = text.split(new RegExp(`(${highlight})`, "gi"))
    return parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <span key={i} className="bg-yellow-500/50 text-white px-1 rounded">
          {part}
        </span>
      ) : (
        part
      ),
    )
  }

  return (
    <div
      onClick={onClick}
      className={`group relative bg-slate-900/50 backdrop-blur-sm border rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1 cursor-pointer ${isBeingChecked ? "border-yellow-400 ring-2 ring-yellow-400/50 scale-105 z-10" : "border-blue-500/20"} h-full flex flex-col`}
    >
      {/* Image Container with gradient overlay */}
      <div className="relative h-48 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 overflow-hidden">
        <img
          src={news.image}
          alt={news.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />

        <div className="absolute top-3 right-3 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleBookmark?.(news.id)
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-all ${isBookmarked ? "bg-pink-500/20 text-pink-500" : "bg-black/30 text-white hover:bg-black/50"}`}
          >
            <Heart className={`w-5 h-5 ${isBookmarked ? "fill-pink-500" : ""}`} />
          </button>
        </div>

        <div className="absolute bottom-3 left-3 right-3">
          <span className="inline-block px-3 py-1 rounded-full bg-blue-600/80 text-white text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm mb-2">
            {news.category}
          </span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <p className="text-slate-400 text-xs mb-3 uppercase tracking-wide">{news.date}</p>
        <h3 className="font-bold text-lg text-white mb-3 line-clamp-2 group-hover:text-cyan-400 transition-colors">
          {getHighlightedText(news.title, searchQuery)}
        </h3>
        <p className="text-slate-400 text-sm line-clamp-2 flex-1">{news.excerpt}</p>

        {/* Footer */}
        <div className="flex items-center justify-end pt-4 mt-auto border-t border-slate-700">
          {news.url ? (
            <a
              href={news.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/40 hover:to-cyan-500/40 border border-blue-500/30 rounded-lg text-xs font-medium text-cyan-400 transition-all duration-300"
            >
              Baca
            </a>
          ) : (
            <button className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/40 hover:to-cyan-500/40 border border-blue-500/30 rounded-lg text-xs font-medium text-cyan-400 transition-all duration-300">
              Baca
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
