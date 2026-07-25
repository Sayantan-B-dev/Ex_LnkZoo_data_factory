import { readFileSync, writeFileSync } from 'fs';

const FILE = process.argv[2] || 'WhatsApp Chat with AllLinksMain.txt';

const text = readFileSync(FILE, 'utf8');

const urlRegex = /https?:\/\/[^\s<>"']+/g;
const raw = text.match(urlRegex) || [];

const seen = new Set();
const urls = [];
for (const u of raw) {
  const cleaned = u.replace(/[.,;:!?)]+$/, '').split('?')[0];
  if (cleaned.length > 10 && !seen.has(cleaned)) {
    seen.add(cleaned);
    urls.push(cleaned);
  }
}

const categories = {};
for (const url of urls) {
  try {
    const domain = new URL(url).hostname.replace(/^www\./, '');
    if (!categories[domain]) categories[domain] = { links: [] };
    categories[domain].links.push(url);
  } catch {
    if (!categories['other']) categories['other'] = { links: [] };
    categories['other'].links.push(url);
  }
}

const total = Object.values(categories).reduce((s, c) => s + c.links.length, 0);
const result = {
  meta: {
    total_links: total,
    generated_at: new Date().toISOString(),
    unique_domains: Object.keys(categories).length,
    source_file: FILE,
  },
  categories,
};

const out = JSON.stringify(result, null, 2);
const outFile = 'links-categorized.json';
writeFileSync(outFile, out, 'utf8');

console.log(`Parsed ${FILE}`);
console.log(`  URLs found: ${urls.length}`);
console.log(`  Domains: ${Object.keys(categories).length}`);
console.log(`  Total links: ${total}`);
console.log(`  Written to: ${outFile}`);
