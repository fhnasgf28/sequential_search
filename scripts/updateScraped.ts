import { scrapeBola } from "../utils/scrapeBola"
import fs from "fs/promises"
import path from "path"

async function main() {
  try {
    const items = await scrapeBola(200) // ambil banyak untuk buffer
    const titles = items.map((i) => i.title).filter(Boolean)
    const dataDir = path.join(process.cwd(), "data")
    await fs.mkdir(dataDir, { recursive: true })
    const out = { updatedAt: new Date().toISOString(), titles }
    await fs.writeFile(path.join(dataDir, "scraped-news.json"), JSON.stringify(out, null, 2), "utf-8")
    console.log("scraped-news.json updated with", titles.length, "titles")
  } catch (err) {
    console.error("updateScraped failed:", err)
    process.exit(1)
  }
}

if (require.main === module) main()
