import type { NextApiRequest, NextApiResponse } from "next"
import fs from "fs/promises"
import path from "path"
import { scrapeBola } from "@/utils/scrapeBola"

type Out = { titles: string[]; updatedAt: string | null; fromCache: boolean; error?: string }

export default async function handler(req: NextApiRequest, res: NextApiResponse<Out>) {
  const dataDir = path.join(process.cwd(), "data")
  const cacheFile = path.join(dataDir, "scraped-news.json")
  const oneDayMs = 24 * 60 * 60 * 1000

  async function writeCache(titles: string[]) {
    await fs.mkdir(dataDir, { recursive: true })
    const payload = { updatedAt: new Date().toISOString(), titles }
    await fs.writeFile(cacheFile, JSON.stringify(payload, null, 2), "utf-8")
  }

  try {
    // try read cache
    try {
      const raw = await fs.readFile(cacheFile, "utf-8")
      const parsed = JSON.parse(raw)
      const titles: string[] = Array.isArray(parsed?.titles) ? parsed.titles : []
      const updatedAt = parsed?.updatedAt ? new Date(parsed.updatedAt) : null
      const ageMs = updatedAt ? Date.now() - updatedAt.getTime() : Infinity

      if (titles.length > 0 && ageMs < oneDayMs) {
        return res.status(200).json({ titles, updatedAt: parsed.updatedAt || null, fromCache: true })
      }
      // else fallthrough to scrape
    } catch {
      // cache missing or invalid -> continue to scrape
    }

    // scrape server-side
    let items = []
    try {
      items = await scrapeBola(200)
    } catch (err: any) {
      // ensure we don't crash; return empty list if scraping fails
      console.error("scraped-news: scrapeBola failed:", err?.message || err)
      return res.status(200).json({ titles: [], updatedAt: null, fromCache: false, error: String(err?.message || err) })
    }

    const titles = items.map((i: any) => i.title).filter(Boolean)
    if (titles.length > 0) {
      try { await writeCache(titles) } catch (e) { /* ignore cache write errors */ }
      return res.status(200).json({ titles, updatedAt: new Date().toISOString(), fromCache: false })
    }

    return res.status(200).json({ titles: [], updatedAt: null, fromCache: false })
  } catch (err: any) {
    const msg = err?.message || String(err)
    return res.status(500).json({ titles: [], updatedAt: null, fromCache: false, error: msg })
  }
}
