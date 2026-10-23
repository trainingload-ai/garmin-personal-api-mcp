import { ImageResponse } from 'next/og';
import { createElement as h } from 'react';

import { getMessagesForLocale } from '@/i18n/messages';
import type { Locale } from '@/lib/content/types';

const size = { width: 1200, height: 630 };

function readText(searchParams: URLSearchParams, key: string, fallback: string, maxLength: number) {
  return (searchParams.get(key)?.trim() || fallback).slice(0, maxLength);
}

export function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const locale: Locale = searchParams.get('locale') === 'zh' ? 'zh' : 'en';
  const copy = getMessagesForLocale(locale);
  const title = readText(searchParams, 'title', copy.metadata.title, 120);
  const description = readText(searchParams, 'description', copy.metadata.description, 260);
  const proof = locale === 'zh'
    ? '完全本地运行 · 25 个只读工具 · 官方 Garmin Personal API'
    : 'Runs entirely on your computer · 25 read-only tools · Official Garmin Personal API';

  return new ImageResponse(
    h(
      'div',
      {
        style: {
          alignItems: 'stretch',
          background: '#101715',
          color: '#f2f7ed',
          display: 'flex',
          fontFamily: 'Arial, sans-serif',
          height: '100%',
          padding: 52,
          width: '100%',
        },
      },
      h(
        'div',
        {
          style: {
            border: '1px solid #365047',
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 48,
          },
        },
        h(
          'div',
          { style: { alignItems: 'center', display: 'flex', fontSize: 24, fontWeight: 700, gap: 14 } },
          h(
            'div',
            {
              style: {
                alignItems: 'center',
                background: '#34d399',
                borderRadius: 5,
                color: '#101715',
                display: 'flex',
                fontSize: 20,
                height: 36,
                justifyContent: 'center',
                width: 36,
              },
            },
            'G:',
          ),
          h('span', null, 'Garmin Personal API MCP'),
        ),
        h(
          'div',
          { style: { display: 'flex', flexDirection: 'column', gap: 20 } },
          h(
            'div',
            {
              style: {
                display: 'flex',
                fontSize: locale === 'zh' ? 58 : 56,
                fontWeight: 700,
                letterSpacing: locale === 'zh' ? '-2px' : '-2.5px',
                lineHeight: 1.05,
                maxWidth: 1010,
              },
            },
            title,
          ),
          h(
            'div',
            { style: { color: '#a4b5ae', display: 'flex', fontSize: 23, lineHeight: 1.35, maxWidth: 1010 } },
            description,
          ),
          h(
            'div',
            { style: { color: '#34d399', display: 'flex', fontSize: 18, fontWeight: 600, marginTop: 6 } },
            proof,
          ),
        ),
      ),
    ),
    size,
  );
}
