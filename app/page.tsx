"use client"

import { useState, useMemo } from "react"
import { Search, TrendingUp, Zap, Target } from "lucide-react"
import NewsCard from "@/components/news-card"
import SearchStats from "@/components/search-stats"
import StatCard from "@/components/stat-card"
import { generateMockNews } from "@/lib/mock-data"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchStats, setSearchStats] = useState<{
    time: number
    itemsChecked: number
    itemsFound: number
  } | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  const allNews = useMemo(() => generateMockNews(), [])

  const stats = useMemo(() => {
    const categories = new Map<string, number>()
    allNews.forEach((news) => {
      categories.set(news.category, (categories.get(news.category) || 0) + 1)
    })

    const topCategory = Array.from(categories.entries()).sort((a, b) => b[1] - a[1])[0]

    return {
      totalNews: allNews.length,
      totalCategories: categories.size,
      topCategory: topCategory?.[0] || "N/A",
      topCategoryCount: topCategory?.[1] || 0,
    }
  }, [allNews])

  // Sequential Search Implementation
  const filteredNews = useMemo(() => {
    if (!searchQuery.trim()) {
      setSearchStats(null)
      return allNews
    }

    setIsSearching(true)
    const startTime = performance.now()
    const query = searchQuery.toLowerCase()
    const results = []
    let itemsChecked = 0

    // Sequential Search: iterate through all items one by one
    for (let i = 0; i < allNews.length; i++) {
      itemsChecked++
      const newsItem = allNews[i]

      // Check if search query matches title or category
      if (newsItem.title.toLowerCase().includes(query) || newsItem.category.toLowerCase().includes(query)) {
        results.push(newsItem)
      }
    }

    const endTime = performance.now()
    const searchTime = endTime - startTime

    setSearchStats({
      time: searchTime,
      itemsChecked,
      itemsFound: results.length,
    })

    setIsSearching(false)
    return results
  }, [searchQuery, allNews])

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
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
            <input
              type="text"
              placeholder="Cari berita olahraga..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 backdrop-blur-md text-white placeholder-slate-400 rounded-lg pl-12 pr-4 py-3 border border-blue-500/30 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 transition-all"
            />
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
