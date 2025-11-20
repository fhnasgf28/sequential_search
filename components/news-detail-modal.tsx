import { X, ExternalLink, Calendar, Tag } from "lucide-react"
import { useEffect } from "react"

interface NewsDetailModalProps {
    news: {
        id: number
        title: string
        category: string
        date: string
        excerpt: string
        image: string
        url?: string
    } | null
    isOpen: boolean
    onClose: () => void
}

export default function NewsDetailModal({ news, isOpen, onClose }: NewsDetailModalProps) {
    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
        }
        window.addEventListener("keydown", handleEsc)
        return () => window.removeEventListener("keydown", handleEsc)
    }, [onClose])

    if (!isOpen || !news) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl bg-slate-900 border border-blue-500/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Image Header */}
                <div className="relative h-64 sm:h-80 shrink-0">
                    <img
                        src={news.image}
                        alt={news.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="px-3 py-1 rounded-full bg-blue-600/90 text-white text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                {news.category}
                            </span>
                            <span className="flex items-center gap-1 text-slate-300 text-sm bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                                <Calendar className="w-3 h-3" />
                                {news.date}
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight shadow-black drop-shadow-lg">
                            {news.title}
                        </h2>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <p className="text-slate-300 text-lg leading-relaxed mb-8">
                        {news.excerpt}
                    </p>

                    <div className="flex justify-end">
                        {news.url && (
                            <a
                                href={news.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5"
                            >
                                Baca Selengkapnya
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
