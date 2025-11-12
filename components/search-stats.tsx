import { Zap, CheckCircle2, Filter } from "lucide-react"

interface SearchStatsProps {
  stats: {
    time: number
    itemsChecked: number
    itemsFound: number
  }
  isSearching: boolean
}

export default function SearchStats({ stats, isSearching }: SearchStatsProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Time */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/30 backdrop-blur-sm transition-all hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20">
          <div className="p-3 rounded-lg bg-blue-500/20">
            <Zap className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Waktu Pencarian</p>
            <p className="text-xl font-bold text-white">{isSearching ? "..." : `${stats.time.toFixed(2)}ms`}</p>
          </div>
        </div>

        {/* Items Checked */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-cyan-600/10 border border-cyan-500/30 backdrop-blur-sm transition-all hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20">
          <div className="p-3 rounded-lg bg-cyan-500/20">
            <Filter className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Item Diperiksa</p>
            <p className="text-xl font-bold text-white">{stats.itemsChecked}</p>
          </div>
        </div>

        {/* Results Found */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-600/10 border border-purple-500/30 backdrop-blur-sm transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20">
          <div className="p-3 rounded-lg bg-purple-500/20">
            <CheckCircle2 className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Hasil Ditemukan</p>
            <p className="text-xl font-bold text-white">{stats.itemsFound}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
