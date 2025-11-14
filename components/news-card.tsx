import type { NewsItem } from "@/lib/mock-data"

interface NewsCardProps {
  news: NewsItem
  searchQuery: string
}

export default function NewsCard({ news, searchQuery }: NewsCardProps) {
  const highlightText = (text: string) => {
    if (!searchQuery.trim()) return text

    const parts = text.split(new RegExp(`(${searchQuery})`, "gi"))
    return parts.map((part, idx) =>
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <mark key={idx} className="bg-cyan-500 text-white rounded px-1">
          {part}
        </mark>
      ) : (
        part
      ),
    )
  }

  return (
    <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 transition-all duration-300 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/20 hover:-translate-y-1 h-full flex flex-col">
      {/* Image Container with gradient overlay */}
      <div className="relative h-48 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 overflow-hidden">
        <img
          src={news.image || "/placeholder.svg"}
          alt={news.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>

        {/* Category Badge */}
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full text-xs font-semibold text-white shadow-lg">
            {news.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <p className="text-slate-400 text-xs mb-3 uppercase tracking-wide">{news.date}</p>
        <h3 className="font-bold text-lg text-white mb-3 line-clamp-2 group-hover:text-cyan-400 transition-colors">
          {highlightText(news.title)}
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
