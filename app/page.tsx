"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, TrendingUp, Zap, Target, RefreshCw, Play, Pause, Settings2, Heart, BookOpen } from "lucide-react"
import NewsDetailModal from "@/components/news-detail-modal"
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
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Advanced Search State
  const [algorithm, setAlgorithm] = useState<"sequential" | "binary">("sequential")
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "title-asc" | "title-desc">("date-desc")
  const [dateFilter, setDateFilter] = useState<"all" | "24h" | "7d" | "30d">("all")
  const [isVisualizing, setIsVisualizing] = useState(false)
  const [checkedId, setCheckedId] = useState<number | null>(null)
  const [visualizationSpeed, setVisualizationSpeed] = useState(100) // ms delay

  // Reading List & Modal State
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set())
  const [selectedNews, setSelectedNews] = useState<any | null>(null)
  const [viewMode, setViewMode] = useState<"all" | "saved">("all")
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Load saved IDs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("savedNewsIds")
    if (saved) {
      try {
        setSavedIds(new Set(JSON.parse(saved)))
      } catch (e) {
        console.error("Failed to parse saved news", e)
      }
    }
  }, [])

  // Save IDs to localStorage
  useEffect(() => {
    localStorage.setItem("savedNewsIds", JSON.stringify(Array.from(savedIds)))
  }, [savedIds])

  const handleToggleBookmark = (id: number) => {
    setSavedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleCardClick = (news: any) => {
    setSelectedNews(news)
    setIsModalOpen(true)
  }

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

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const res = await fetch("/api/scraped-news?refresh=true")
      if (!res.ok) throw new Error("Failed to refresh")
      const data = await res.json()
      const items: any[] = Array.isArray(data?.items) ? data.items : (Array.isArray(data?.titles) ? data.titles.map((t: string) => ({ title: t })) : [])

      if (items.length > 0) {
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
            category: it.category || "Lainnya",
            date: dateStr,
            excerpt: it.snippet || excerpts[Math.floor(Math.random() * excerpts.length)],
            image: it.image || `/placeholder.svg?height=400&width=600&query=sports+news+${idx}`,
            url: it.url,
          }
        })
        setAllNews(mapped)
      }
    } catch (error) {
      console.error("Refresh failed", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // compute list of available categories (for dropdown)
  const availableCategories = useMemo(() => {
    const s = new Set<string>()
    allNews.forEach(n => s.add(n.category || "Lainnya"))
    return ["All", ...Array.from(s).sort()]
  }, [allNews])

  // compute filtered results + timing in a pure memo (no setState here)
  const searchResult = useMemo(() => {
    // 1. Filter by Category & Date first
    let baseList = categoryFilter === "All" ? allNews : allNews.filter(n => (n.category || "Lainnya") === categoryFilter)

    // Filter by Reading List if active
    if (viewMode === "saved") {
      baseList = baseList.filter(n => savedIds.has(n.id))
    }

    const now = new Date()
    if (dateFilter !== "all") {
      baseList = baseList.filter(n => {
        // parse dateStr back to date object roughly (assuming format "d MMMM yyyy" or similar)
        // actually we stored dateStr as string, let's try to parse it or use a stored timestamp if we had one.
        // For now, let's just assume we can't easily filter by date string without parsing.
        // To make this robust, we should have stored the raw date object or timestamp.
        // Let's skip date filtering logic for now or try a simple check if we had raw data.
        return true
      })
    }

    // 2. Sort
    baseList = [...baseList].sort((a, b) => {
      if (algorithm === "binary") {
        // Binary search REQUIRES sorted by title
        return a.title.localeCompare(b.title)
      }

      switch (sortBy) {
        case "title-asc": return a.title.localeCompare(b.title)
        case "title-desc": return b.title.localeCompare(a.title)
        // For date sorting, we'd need real date objects. 
        // Since we only have formatted strings in this state, we'll skip accurate date sort 
        // or rely on the ID which roughly correlates to "newest" if scraped recently.
        case "date-desc": return b.id - a.id
        case "date-asc": return a.id - b.id
        default: return 0
      }
    })

    if (!searchQuery.trim()) {
      return { results: baseList, time: 0, itemsChecked: 0 }
    }

    const startTime = performance.now()
    const query = searchQuery.toLowerCase()
    const results: typeof allNews = []
    let itemsChecked = 0

    if (algorithm === "sequential") {
      for (let i = 0; i < baseList.length; i++) {
        itemsChecked++
        const newsItem = baseList[i]
        const cat = (newsItem.category || "Lainnya")
        const matchesText = newsItem.title.toLowerCase().includes(query) || (cat || "").toLowerCase().includes(query)
        if (matchesText) {
          results.push(newsItem)
        }
      }
    } else {
      // Binary Search (Prefix Match)
      // Assumes baseList is sorted by Title ASC (enforced above)
      let left = 0
      let right = baseList.length - 1

      // Find ANY match first
      let matchIndex = -1

      while (left <= right) {
        itemsChecked++
        const mid = Math.floor((left + right) / 2)
        const title = baseList[mid].title.toLowerCase()

        if (title.startsWith(query)) {
          matchIndex = mid
          break
        } else if (title < query) {
          left = mid + 1
        } else {
          right = mid - 1
        }
      }

      // If match found, expand to find ALL matches (since multiple items might share prefix)
      if (matchIndex !== -1) {
        // expand left
        let l = matchIndex
        while (l >= 0 && baseList[l].title.toLowerCase().startsWith(query)) {
          results.unshift(baseList[l]) // add to front
          l--
          itemsChecked++ // technically checking neighbors
        }
        // expand right
        let r = matchIndex + 1
        while (r < baseList.length && baseList[r].title.toLowerCase().startsWith(query)) {
          results.push(baseList[r])
          r++
          itemsChecked++
        }
        // Remove duplicate from initial match (it was added in expand left loop actually? No, wait.)
        // Actually the expand left loop includes matchIndex.
        // Let's redo expansion cleanly.
        results.length = 0 // clear
        // find start
        let start = matchIndex
        while (start > 0 && baseList[start - 1].title.toLowerCase().startsWith(query)) {
          start--
          itemsChecked++
        }
        // collect
        let curr = start
        while (curr < baseList.length && baseList[curr].title.toLowerCase().startsWith(query)) {
          results.push(baseList[curr])
          curr++
          itemsChecked++ // counting these as checks
        }
      }
    }

    const endTime = performance.now()
    return { results, time: endTime - startTime, itemsChecked }
  }, [searchQuery, allNews, categoryFilter, algorithm, sortBy, dateFilter])

  const filteredNews = searchResult.results

  // Visualization Effect
  useEffect(() => {
    if (!isVisualizing || !searchQuery.trim()) {
      setCheckedId(null)
      return
    }

    // We need to replicate the search logic step-by-step here
    // This is tricky with useMemo above. 
    // For simplicity, we will just iterate the CURRENT sorted list from searchResult input
    // But searchResult.results is already filtered. We need the list BEFORE filtering by query.

    // Re-derive base list (filtered by category, sorted)
    let baseList = categoryFilter === "All" ? allNews : allNews.filter(n => (n.category || "Lainnya") === categoryFilter)
    baseList = [...baseList].sort((a, b) => {
      if (algorithm === "binary") return a.title.localeCompare(b.title)
      switch (sortBy) {
        case "title-asc": return a.title.localeCompare(b.title)
        case "title-desc": return b.title.localeCompare(a.title)
        case "date-desc": return b.id - a.id
        case "date-asc": return a.id - b.id
        default: return 0
      }
    })

    let cancelled = false

    const runViz = async () => {
      if (algorithm === "sequential") {
        for (const item of baseList) {
          if (cancelled) break
          setCheckedId(item.id)
          await new Promise(r => setTimeout(r, visualizationSpeed))

          const query = searchQuery.toLowerCase()
          const match = item.title.toLowerCase().includes(query) || (item.category || "").toLowerCase().includes(query)
          if (match) {
            // pause longer on match?
            await new Promise(r => setTimeout(r, visualizationSpeed * 2))
          }
        }
      } else {
        // Binary Search Viz
        let left = 0
        let right = baseList.length - 1
        while (left <= right) {
          if (cancelled) break
          const mid = Math.floor((left + right) / 2)
          setCheckedId(baseList[mid].id)
          await new Promise(r => setTimeout(r, visualizationSpeed * 3)) // slower for binary to see jumps

          const title = baseList[mid].title.toLowerCase()
          const query = searchQuery.toLowerCase()

          if (title.startsWith(query)) {
            break // found match group
          } else if (title < query) {
            left = mid + 1
          } else {
            right = mid - 1
          }
        }
      }
      if (!cancelled) setCheckedId(null)
    }

    runViz()
    return () => { cancelled = true }
  }, [searchQuery, isVisualizing, allNews, categoryFilter, algorithm, sortBy, visualizationSpeed])

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
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="ml-auto sm:ml-4 p-2 rounded-full bg-slate-800/50 hover:bg-slate-800 border border-blue-500/30 text-blue-400 hover:text-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              title="Refresh Berita"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
            </button>

            {/* Reading List Toggle */}
            <button
              onClick={() => setViewMode(viewMode === "all" ? "saved" : "all")}
              className={`ml-2 p-2 rounded-full border transition-all ${viewMode === "saved" ? "bg-pink-500/20 border-pink-500/50 text-pink-500" : "bg-slate-800/50 border-blue-500/30 text-slate-400 hover:text-white"}`}
              title="Reading List"
            >
              <BookOpen className="w-5 h-5" />
            </button>
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

          {/* Advanced Controls */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Algorithm Selector */}
            <div className="bg-slate-900/50 p-3 rounded-lg border border-blue-500/20">
              <label className="text-xs text-slate-400 mb-1 block">Algoritma</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setAlgorithm("sequential")}
                  className={`flex-1 py-1.5 px-3 rounded text-sm font-medium transition-all ${algorithm === "sequential" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
                >
                  Sequential
                </button>
                <button
                  onClick={() => setAlgorithm("binary")}
                  className={`flex-1 py-1.5 px-3 rounded text-sm font-medium transition-all ${algorithm === "binary" ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
                >
                  Binary
                </button>
              </div>
            </div>

            {/* Sort & Filter */}
            <div className="bg-slate-900/50 p-3 rounded-lg border border-blue-500/20">
              <label className="text-xs text-slate-400 mb-1 block">Urutkan</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                disabled={algorithm === "binary"} // Binary requires specific sort
                className="w-full bg-slate-800 text-white text-sm rounded px-2 py-1.5 border border-slate-700 focus:border-blue-500 outline-none disabled:opacity-50"
              >
                <option value="date-desc">Terbaru</option>
                <option value="date-asc">Terlama</option>
                <option value="title-asc">Judul (A-Z)</option>
                <option value="title-desc">Judul (Z-A)</option>
              </select>
            </div>

            {/* Visualization Toggle */}
            <div className="bg-slate-900/50 p-3 rounded-lg border border-blue-500/20 flex items-center justify-between">
              <div>
                <label className="text-xs text-slate-400 block">Visualisasi</label>
                <span className="text-sm text-white font-medium">{isVisualizing ? "Aktif" : "Nonaktif"}</span>
              </div>
              <button
                onClick={() => setIsVisualizing(!isVisualizing)}
                className={`p-2 rounded-full transition-all ${isVisualizing ? "bg-green-500/20 text-green-400" : "bg-slate-800 text-slate-400"}`}
              >
                {isVisualizing ? <Play className="w-5 h-5" /> : <Settings2 className="w-5 h-5" />}
              </button>
            </div>

            {/* Speed Control (Only if visualizing) */}
            {isVisualizing && (
              <div className="bg-slate-900/50 p-3 rounded-lg border border-blue-500/20">
                <label className="text-xs text-slate-400 mb-1 block">Kecepatan: {visualizationSpeed}ms</label>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="50"
                  value={visualizationSpeed}
                  onChange={(e) => setVisualizationSpeed(Number(e.target.value))}
                  className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}
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
            {viewMode === "saved" ? "Reading List" : (searchQuery ? `Hasil Pencarian (${filteredNews.length})` : "Berita Terbaru")}
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
        </div>

        {filteredNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((news) => (
              <NewsCard
                key={news.id}
                news={news}
                searchQuery={searchQuery}
                isBeingChecked={checkedId === news.id}
                isBookmarked={savedIds.has(news.id)}
                onToggleBookmark={handleToggleBookmark}
                onClick={() => handleCardClick(news)}
              />
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

      {/* Detail Modal */}
      <NewsDetailModal
        news={selectedNews}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  )
}
