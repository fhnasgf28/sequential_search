import * as cheerio from 'cheerio';
import axios from 'axios';

export type NewsItem = {
  title: string;
  snippet?: string;
  url?: string;
  datetime?: string; // added
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
    const container = $(el).closest("article, .article, .media, .grid-item, .list-content, .card");
    if (container.length) {
      const p = container.find("p").first();
      if (p.length) snippet = p.text().trim().slice(0, 200);
    }

    // ekstrak datetime dari <time datetime="..."> (jika ada)
    let datetime: string | undefined;
    // cek dalam container dulu, lalu coba di level article/a terdekat
    if (container.length) {
      const timeEl = container.find('time[datetime]').first();
      if (timeEl.length) datetime = timeEl.attr('datetime')?.trim();
    }
    if (!datetime) {
      const timeEl2 = $(el).closest('article, .article, .media, .grid-item').find('time[datetime]').first();
      if (timeEl2.length) datetime = timeEl2.attr('datetime')?.trim();
    }
    // final fallback: cari time elemen umum di sekitar elemen
    if (!datetime) {
      const timeNear = $(el).parent().find('time[datetime]').first();
      if (timeNear.length) datetime = timeNear.attr('datetime')?.trim();
    }

    items.push({ title, snippet, url, datetime });
  });

  return items;
}