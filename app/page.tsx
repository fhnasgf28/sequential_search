"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, TrendingUp, Zap, Target } from "lucide-react"
import NewsCard from "@/components/news-card"
import SearchStats from "@/components/search-stats"
import StatCard from "@/components/stat-card"
import { generateMockNews } from "@/lib/mock-data"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [searchStats, setSearchStats] = useState<{
    time: number
    itemsChecked: number
    itemsFound: number
  } | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  // start with static/local data, then try to load scraped titles from server
  const [allNews, setAllNews] = useState(() => generateMockNews())

  useEffect(() => {
    let mounted = true
    async function loadScraped() {
      try {
        const res = await fetch("/api/scraped-news")
        if (!res.ok) return
        const data = await res.json()
        const items: any[] = Array.isArray(data?.items) ? data.items : (Array.isArray(data?.titles) ? data.titles.map((t: string) => ({ title: t })) : [])
        if (mounted && items.length > 0) {
           // map scraped titles to same NewsItem shape used by UI
           const categories = ["Sepak Bola", "Basket", "Tenis", "F1", "MMA", "Bulu Tangkis"]
           const excerpts = [
             "Pemain bintang menunjukkan performa luar biasa dalam pertandingan yang menghibur.",
             "Kemenangan besar membawa tim ke posisi teratas klasemen.",
             "Performa spektakuler dari atlet membuat fans terpesona.",
             "Drama menarik terjadi di detik-detik akhir pertandingan.",
             "Rekor baru tercipta dalam sejarah kompetisi ini.",
             "Tim berhasil pulih setelah mengalami periode sulit.",
             "Strategi baru terbukti efektif dalam pertandingan kali ini.",
             "Penonton merasa puas dengan pertunjukan tim kesayangan.",
           ]
 
          const mapped = items.slice(0, 200).map((it, idx) => {
             // format date from scraped datetime if available, else random fallback
             let dateStr = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString("id-ID", {
               year: "numeric",
               month: "long",
               day: "numeric",
             })
             if (it?.datetime) {
               const d = new Date(it.datetime)
               if (!isNaN(d.getTime())) {
                 dateStr = d.toLocaleString("id-ID", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })
               }
             }
 
             return {
               id: idx + 1,
               title: it.title,
               // ensure category is always a string (fallback "Lainnya")
               category: it.category || "Lainnya",
               date: dateStr,
               excerpt: it.snippet || excerpts[Math.floor(Math.random() * excerpts.length)],
               image: it.image || `/placeholder.svg?height=400&width=600&query=sports+news+${idx}`,
               url: it.url,
             }
           })
           setAllNews(mapped)
         }
       } catch {
         // ignore and keep static data
       }
     }
     loadScraped()
     return () => {
       mounted = false
     }
   }, [])
 
   // compute list of available categories (for dropdown)
   const availableCategories = useMemo(() => {
     const s = new Set<string>()
     allNews.forEach(n => s.add(n.category || "Lainnya"))
     return ["All", ...Array.from(s).sort()]
   }, [allNews])
 
  // compute filtered results + timing in a pure memo (no setState here)
  const searchResult = useMemo(() => {
    if (!searchQuery.trim()) {
      // still apply category filter even when no text query
      const results = categoryFilter === "All" ? allNews : allNews.filter(n => (n.category || "Lainnya") === categoryFilter)
      return { results, time: 0, itemsChecked: 0 }
    }

    const startTime = performance.now()
    const query = searchQuery.toLowerCase()
    const results: typeof allNews = []
    let itemsChecked = 0

    for (let i = 0; i < allNews.length; i++) {
      itemsChecked++
      const newsItem = allNews[i]
      const cat = (newsItem.category || "Lainnya")
      const matchesText = newsItem.title.toLowerCase().includes(query) || (cat || "").toLowerCase().includes(query)
      const matchesCategory = categoryFilter === "All" ? true : (cat === categoryFilter)
      if (matchesText && matchesCategory) {
        results.push(newsItem)
      }
    }

    const endTime = performance.now()
    return { results, time: endTime - startTime, itemsChecked }
  }, [searchQuery, allNews, categoryFilter])

  const filteredNews = searchResult.results

  // update search-related state in an effect (no state updates inside useMemo)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchStats(null)
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    setSearchStats({
      time: searchResult.time,
      itemsChecked: searchResult.itemsChecked,
      itemsFound: searchResult.results.length,
    })
    setIsSearching(false)
  }, [searchResult, searchQuery])

  // compute stats from the currently visible list (filteredNews)
  const stats = useMemo(() => {
    const categories = new Map<string, number>()
    filteredNews.forEach((news) => {
      const cat = news.category || "Lainnya"
      categories.set(cat, (categories.get(cat) || 0) + 1)
    })

    const topCategory = Array.from(categories.entries()).sort((a, b) => b[1] - a[1])[0]

    return {
      totalNews: filteredNews.length,
      totalCategories: categories.size,
      topCategory: topCategory?.[0] || "N/A",
      topCategoryCount: topCategory?.[1] || 0,
    }
  }, [filteredNews])

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      {/* Header */}
      <header className="bg-slate-950/80 backdrop-blur-xl border-b border-blue-500/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse"></div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              SPORTS DASHBOARD
            </h1>
          </div>

          {/* Search Bar */}
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-3">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
            <input
              type="text"
              placeholder="Cari berita olahraga..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 backdrop-blur-md text-white placeholder-slate-400 rounded-lg pl-12 pr-4 py-3 border border-blue-500/30 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 transition-all"
            />
            {/* Category dropdown */}
            <div className="mt-3 sm:mt-0 sm:ml-4">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-900 text-white rounded-md border border-blue-500/20 px-3 py-2 focus:outline-none"
              >
                {availableCategories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Statistics Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard icon={Target} label="Total Berita" value={stats.totalNews} color="from-blue-500 to-blue-600" />
          <StatCard
            icon={TrendingUp}
            label="Kategori"
            value={stats.totalCategories}
            color="from-cyan-500 to-cyan-600"
          />
          <StatCard
            icon={Zap}
            label="Kategori Top"
            value={stats.topCategory}
            subValue={`${stats.topCategoryCount} berita`}
            color="from-purple-500 to-pink-600"
          />
          <StatCard
            icon={Search}
            label="Waktu Pencarian"
            value={searchStats ? `${searchStats.time.toFixed(2)}ms` : "—"}
            subValue={searchStats ? `${searchStats.itemsFound} hasil` : "N/A"}
            color="from-orange-500 to-red-600"
          />
        </div>
      </div>

      {/* Search Statistics */}
      {searchStats && <SearchStats stats={searchStats} isSearching={isSearching} />}

      {/* News Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            {searchQuery ? `Hasil Pencarian (${filteredNews.length})` : "Berita Terbaru"}
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
        </div>

        {filteredNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((news) => (
              <NewsCard key={news.id} news={news} searchQuery={searchQuery} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-96">
            <div className="text-center">
              <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-300 mb-2">Tidak ada berita ditemukan</h3>
              <p className="text-slate-400">Coba cari dengan kata kunci yang berbeda</p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
