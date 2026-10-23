import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const outputDirectory = path.resolve('apps/docs/out');
const pages = [
  {
    canonical: 'https://garminpersonalapi.com',
    file: 'index.html',
    lang: 'en',
    openGraphImage: 'https://garminpersonalapi.com/og/en.png',
  },
  {
    canonical: 'https://garminpersonalapi.com/zh',
    file: 'zh.html',
    lang: 'zh-CN',
    openGraphImage: 'https://garminpersonalapi.com/og/zh.png',
  },
];

for (const page of pages) {
  const html = await readFile(path.join(outputDirectory, page.file), 'utf8');

  assert.match(html, new RegExp(`<html[^>]+lang="${page.lang}"`), `${page.file} has the wrong lang`);
  assert.ok(html.includes(`<link rel="canonical" href="${page.canonical}"`), `${page.file} is missing its canonical URL`);
  assert.ok(html.includes(`content="${page.openGraphImage}"`), `${page.file} is missing its Open Graph image`);
  assert.ok(html.includes('name="twitter:card" content="summary_large_image"'), `${page.file} is missing its Twitter card`);
  assert.ok(html.includes('hrefLang="en"'), `${page.file} is missing the English hreflang`);
  assert.ok(html.includes('hrefLang="zh-CN"'), `${page.file} is missing the Chinese hreflang`);
  assert.ok(html.includes('hrefLang="x-default"'), `${page.file} is missing the default hreflang`);
  assert.ok(html.includes('type="application/ld+json"'), `${page.file} is missing structured data`);
  assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1, `${page.file} must contain exactly one h1`);
}

await Promise.all([
  access(path.join(outputDirectory, '404.html')),
  access(path.join(outputDirectory, 'icon.svg')),
  access(path.join(outputDirectory, 'og/en.png')),
  access(path.join(outputDirectory, 'og/zh.png')),
  access(path.join(outputDirectory, 'robots.txt')),
  access(path.join(outputDirectory, 'sitemap.xml')),
]);

console.log('Static docs export verified: / and /zh are ready to deploy.');
