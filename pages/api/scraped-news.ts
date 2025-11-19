import type { NextApiRequest, NextApiResponse } from "next"
import fs from "fs/promises"
import path from "path"
import { scrapeBola } from "@/utils/scrapeBola"

type ScrapedItem = { title: string; url?: string; datetime?: string; snippet?: string; image?: string; category?: string }
type Out = { items: ScrapedItem[]; updatedAt: string | null; fromCache: boolean; error?: string }

export default async function handler(req: NextApiRequest, res: NextApiResponse<Out>) {
  const dataDir = path.join(process.cwd(), "data")
  const cacheFile = path.join(dataDir, "scraped-news.json")
  const oneDayMs = 24 * 60 * 60 * 1000

  async function writeCache(items: ScrapedItem[]) {
    await fs.mkdir(dataDir, { recursive: true })
    const payload = { updatedAt: new Date().toISOString(), items }
    await fs.writeFile(cacheFile, JSON.stringify(payload, null, 2), "utf-8")
  }

  try {
    // try read cache
    try {
      const raw = await fs.readFile(cacheFile, "utf-8")
      const parsed = JSON.parse(raw)
      const items: ScrapedItem[] = Array.isArray(parsed?.items) ? parsed.items : []
      const updatedAt = parsed?.updatedAt ? new Date(parsed.updatedAt) : null
      const ageMs = updatedAt ? Date.now() - updatedAt.getTime() : Infinity

      if (items.length > 0 && ageMs < oneDayMs && req.query.refresh !== "true") {
        return res.status(200).json({ items, updatedAt: parsed.updatedAt || null, fromCache: true })
      }
      // else fallthrough -> re-scrape
    } catch {
      // cache missing/invalid -> continue to scrape
    }

    // scrape server-side
    let itemsRaw = []
    try {
      itemsRaw = await scrapeBola(200)
    } catch (err: any) {
      console.error("scraped-news: scrapeBola failed:", err?.message || err)
      return res.status(200).json({ items: [], updatedAt: null, fromCache: false, error: String(err?.message || err) })
    }

    const items: ScrapedItem[] = (itemsRaw as any[]).map((it) => ({
      title: it.title,
      url: it.url,
      datetime: it.datetime,
      snippet: it.snippet,
      image: it.image, // include image from scraper
      category: it.category, // include category if scraper provided
    })).filter(Boolean)

    if (items.length > 0) {
      try { await writeCache(items) } catch (e) { /* ignore cache write errors */ }
      return res.status(200).json({ items, updatedAt: new Date().toISOString(), fromCache: false })
    }

    return res.status(200).json({ items: [], updatedAt: null, fromCache: false })
  } catch (err: any) {
    const msg = err?.message || String(err)
    return res.status(500).json({ items: [], updatedAt: null, fromCache: false, error: msg })
  }
}
