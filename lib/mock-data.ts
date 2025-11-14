export interface NewsItem {
  id: number
  title: string
  category: string
  date: string
  excerpt: string
  image: string
  url?: string
}

export function generateMockNews(): NewsItem[] {
  const categories = ["Sepak Bola", "Basket", "Tenis", "F1", "MMA", "Bulu Tangkis"]

  const newsTitles = [
    "Messi Cetak 2 Gol saat Paris Menang 3-1 atas Lyon",
    "Barcelona Kembali Raih Posisi Puncak dengan Kemenangan 4-0",
    "Ronaldo Teken Kontrak Tiga Tahun dengan klub Saudi",
    "Real Madrid Lolos ke Final Champions League setelah Kalahkan Manchester",
    "Liverpool Seri 2-2 dengan Brighton di Etihad",
    "Kompetisi Basket NBA: Lakers Mengalahkan Celtics 125-118",
    "Golden State Warriors Menang Lagi Jadi Pemimpin Konferensi",
    "LeBron James Cetak Triple-Double dalam Pertandingan",
    "Miami Heat Bangkit Setelah Kalah 5 Laga Beruntun",
    "Novak Djokovic Maju ke Babak Semifinal Australian Open",
    "Serena Williams Konfirmasi Pensiun dari Tenis Profesional",
    "Wimbledon 2024: Kejutan Besar dari Pemain Muda",
    "Rafael Nadal Kembali Bermain Setelah Cedera",
    "Turnamen Internasional Tenis Dihadiri Juara Dunia",
    "Max Verstappen Raih Podium Pertama di F1 2024",
    "Lewis Hamilton Berhasil Pulih dari Masalah Mesin",
    "Fernando Alonso Catat Rekor Lap Tercepat di Bahrain",
    "Strategi Baru Ferrari di Sesi Qualifying",
    "Dana White Umumkan Pertandingan Besar untuk UFC 300",
    "Conor McGregor Siap Kembali ke Octagon",
    "Israel Adesanya Catat Kemenangan Spektakuler",
    "Pertandingan Juara Dunia MMA Dipercepat",
    "Anthony Joshua Menang KO di Putaran Pertama",
    "Pertandingan Tinju Besar Dihadiri Ribuan Fans",
    "Atlet Bulu Tangkis Indonesia Raih Emas di Badminton Asia",
    "Ganda Campuran Memenangkan Turnamen Internasional",
    "Juara Dunia Bulu Tangkis Siap Berlaga",
    "Tim Indonesia Melaju ke Final Piala Thomas",
  ]

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

  return newsTitles.map((title, idx) => ({
    id: idx + 1,
    title,
    category: categories[Math.floor(Math.random() * categories.length)],
    date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    excerpt: excerpts[Math.floor(Math.random() * excerpts.length)],
    image: `/placeholder.svg?height=400&width=600&query=sports+news+${idx}`,
    url: undefined,
  }))
}
