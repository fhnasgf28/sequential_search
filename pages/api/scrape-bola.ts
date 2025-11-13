import type { NextApiRequest, NextApiResponse } from "next";
import { scrapeBola } from "@/utils/scrapeBola";
import fs from "fs/promises";
import path from "path";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).end();
  }
  try {
    const items = await scrapeBola(200);
    const titles = items.map((i) => i.title).filter(Boolean);
    const dataDir = path.join(process.cwd(), "data");
    await fs.mkdir(dataDir, { recursive: true });
    const out = { updatedAt: new Date().toISOString(), titles };
    await fs.writeFile(path.join(dataDir, "scraped-news.json"), JSON.stringify(out, null, 2), "utf-8");
    return res.status(200).json({ ok: true, count: titles.length });
  } catch (err) {
    console.error("API scrape failed:", err);
    return res.status(500).json({ ok: false, error: String(err) });
  }
}