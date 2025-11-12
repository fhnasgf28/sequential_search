'use client'
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  subValue?: string
  color: string
}

export default function StatCard({ icon: Icon, label, value, subValue, color }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-6 transition-all duration-300 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20">
      {/* Gradient background on hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
      ></div>

      {/* Content */}
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400 mb-2">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-white">{value}</p>
            {subValue && <p className="text-xs text-slate-400">{subValue}</p>}
          </div>
        </div>
        <div className={`rounded-lg bg-gradient-to-br ${color} p-3 shadow-lg shadow-${color.split("-")[1]}-500/50`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${color} group-hover:w-full transition-all duration-500`}
      ></div>
    </div>
  )
}
