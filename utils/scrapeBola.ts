import * as cheerio from 'cheerio';
import axios from 'axios';

export type NewsItem = {
  title: string;
  snippet?: string;
  url?: string;
};

export async function scrapeBola(limit = 20): Promise<NewsItem[]> {
  const res = await axios.get("https://www.bola.com/");
  const $ = cheerio.load(res.data, { decodeEntities: true });

  const items: NewsItem[] = [];
  // cari semua elemen yang punya atribut data-template-var="title"
  $('[data-template-var="title"]').each((i, el) => {
    if (items.length >= limit) return;
    const title = $(el).text().trim();
    // coba ambil URL jika ada di parent <a>
    const a = $(el).closest("a");
    const url = a.attr("href") ? new URL(a.attr("href")!, "https://www.bola.com").toString() : undefined;

    // cari snippet: cari <p> di dalam container, atau atribut lain, fallback ambil potongan title
    let snippet: string | undefined;
    const container = $(el).closest("article, .article, .media, .grid-item");
    if (container.length) {
      const p = container.find("p").first();
      if (p.length) snippet = p.text().trim().slice(0, 200);
    }
    // fallback: ambil meta description dari a.href (opsional, berat)
    items.push({ title, snippet, url });
  });

  return items;
}