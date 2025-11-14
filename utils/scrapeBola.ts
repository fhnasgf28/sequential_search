import * as cheerio from 'cheerio';
import axios from 'axios';

export type NewsItem = {
  title: string;
  snippet?: string;
  url?: string;
  datetime?: string;
  image?: string;
  category?: string;
};

// try to read category from article page metadata/links
async function fetchArticleCategory(url: string) {
  try {
    const res = await axios.get(url, { responseType: "text", headers: { "User-Agent": "Mozilla/5.0 (compatible; DendiBot/1.0)" }, timeout: 8000 });
    if (!res?.data) return undefined;
    const $ = cheerio.load(res.data);
    const cand = $(
      '[data-template-var="category"], a[data-template-var="category"], .articles--iridescent-list--text-item__category, .breadcrumb a, .breadcrumbs a, .meta__category a, .article__category a'
    ).first();
    if (cand && cand.length) {
      const txt = cand.text().trim();
      if (txt) return txt;
    }
    const metaSection = $('meta[name="section"]').attr("content") || $('meta[property="article:section"]').attr("content") || $('meta[name="category"]').attr("content");
    if (metaSection) return String(metaSection).trim();
  } catch {
    // ignore fetch errors
  }
  return undefined;
}

// simple heuristics: infer category from title keywords when scraping fails
function inferCategoryFromTitle(title: string | undefined) {
  if (!title) return undefined;
  const t = title.toLowerCase();
  const mapping: Array<[string[], string]> = [
    [["liga","sepak","pssi","timnas","arsenal","manchester","barcelona","real","ronaldo","messi","juventus","chelsea","mu","premier","la liga","spanyol"], "Sepak Bola"],
    [["basket","nba","lakers","celtics","warriors","lebron","heat"], "Basket"],
    [["tenis","wimbledon","djokovic","serena","nadal"], "Tenis"],
    [["f1","verstappen","hamilton","alons o","formula"], "F1"],
    [["mma","ufc","conor","dana white","tinju","petarung","tinju"], "MMA"],
    [["bulu tangkis","badminton","thomas","uber","ganda"], "Bulu Tangkis"],
    [["motogp","buriram","ducati","marquez","motogp"], "MotoGP"],
    [["ragam","hiburan","video","byon","showbiz","vidio"], "Ragam"],
    [["news","berita"], "News"],
  ];
  for (const [keys, cat] of mapping) {
    if (keys.some(k => t.includes(k))) return cat;
  }
  return undefined;
}

export async function scrapeBola(limit = 20): Promise<NewsItem[]> {
  const res = await axios.get("https://www.bola.com/", { responseType: "text", headers: { "User-Agent": "Mozilla/5.0 (compatible; DendiBot/1.0)" }, timeout: 10000 });
  const $ = cheerio.load(res.data, { decodeEntities: true });

  const items: NewsItem[] = [];
  const titleEls = $('[data-template-var="title"]').toArray();
  let articleFetches = 0;
  const maxArticleFetch = 40;

  for (const el of titleEls) {
    if (items.length >= limit) break;
    const $el = $(el);
    const title = $el.text().trim();
    if (!title) continue;
    const a = $el.closest("a");
    const href = a.attr("href");
    const url = href ? (href.startsWith("http") ? href : new URL(href, "https://www.bola.com").toString()) : undefined;

    // snippet + container
    let snippet: string | undefined;
    const container = $el.closest("article, .article, .media, .grid-item, .list-content, .card, li, .text-item");
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

    // category extraction (selectors -> fetch article -> infer from title)
    let category: string | undefined;
    const catSelectors = '[data-template-var="category"], a[data-template-var="category"], .articles--iridescent-list--text-item__category, a[class*="category"], .meta__category a, .article__category a';

    if (container.length) {
      const catEl = container.find(catSelectors).first();
      if (catEl.length) category = catEl.text().trim();
    }
    if (!category) {
      const wrapper = $el.closest('li, .articles--iridescent-list--text-item, .list-item, article, .grid-item');
      if (wrapper.length) {
        const cat2 = wrapper.find(catSelectors).first();
        if (cat2.length) category = cat2.text().trim();
      }
    }
    if (!category) {
      const nearby = $el.parent().find(catSelectors).first();
      if (nearby.length) category = nearby.text().trim();
    }
    if (!category && url && articleFetches < maxArticleFetch) {
      // try fetch article page for category
      articleFetches++;
      try {
        const fetched = await fetchArticleCategory(url);
        if (fetched) category = fetched;
      } catch {
        // ignore
      }
    }
    // final fallback: infer from title keywords
    if (!category) {
      category = inferCategoryFromTitle(title);
    }
    if (category === "") category = undefined;

    // extract image from data-template-var="image" or fallback to first <img>
    let image: string | undefined;
    if (container.length) {
      const imageEl = container.find('[data-template-var="image"]').first();
      if (imageEl.length) {
        if (imageEl.is("img")) {
          const src = imageEl.attr("data-src") || imageEl.attr("data-original") || imageEl.attr("data-lazy-src") || imageEl.attr("src");
          if (src) image = src.startsWith("http") ? src : new URL(src, "https://www.bola.com").toString();
        } else {
          const innerImg = imageEl.find("img").first();
          if (innerImg.length) {
            const src = innerImg.attr("data-src") || innerImg.attr("data-original") || innerImg.attr("data-lazy-src") || innerImg.attr("src");
            if (src) image = src.startsWith("http") ? src : new URL(src, "https://www.bola.com").toString();
          } else {
            const srcAttr = imageEl.attr("data-src") || imageEl.attr("data-image") || imageEl.attr("src");
            if (srcAttr) image = srcAttr.startsWith("http") ? srcAttr : new URL(srcAttr, "https://www.bola.com").toString();
            else {
              const style = imageEl.attr("style") || "";
              const m = /background-image:\s*url\(["']?(.*?)["']?\)/i.exec(style);
              if (m && m[1]) image = m[1].startsWith("http") ? m[1] : new URL(m[1], "https://www.bola.com").toString();
            }
          }
        }
      }
      // fallback: first img in container
      if (!image) {
        const img = container.find("img").first();
        if (img.length) {
          const src = img.attr("data-src") || img.attr("data-original") || img.attr("data-lazy-src") || img.attr("src");
          if (src) image = src.startsWith("http") ? src : new URL(src, "https://www.bola.com").toString();
        }
      }
    }

    const item: NewsItem = { title, snippet, url, datetime };
    if (image) item.image = image;
    if (category) item.category = category;
    items.push(item);
  }

  return items;
}