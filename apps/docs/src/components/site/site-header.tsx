import { Github } from 'lucide-react';
import Image from 'next/image';

import { PageFrame } from '@/components/landing/page-frame';
import { Button } from '@/components/ui/button';
import { getLandingMessages } from '@/i18n/get-messages';
import type { Locale } from '@/lib/content/types';
import { localePath } from '@/lib/seo/url';
import { site } from '@/lib/site';

import { LanguageMenu } from './language-menu';
import { MobileNav } from './mobile-nav';
import { ThemeMenu } from './theme-menu';

export async function SiteHeader({ locale }: { locale: Locale }) {
  const copy = (await getLandingMessages()).nav;
  const links = [
    { href: '#how-it-works', label: copy.how },
    { href: '#quickstart', label: copy.quickstart },
    { href: '#data', label: copy.data },
    { href: '#privacy', label: copy.security },
    { href: '#faq', label: copy.faq },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/92 backdrop-blur-md">
      <PageFrame className="flex h-14 items-center px-5 sm:px-8 lg:px-10">
        <a className="flex shrink-0 items-center gap-2.5 rounded-sm font-semibold tracking-[-0.02em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href={localePath(locale, '#top')} aria-label={copy.home}>
          <Image alt="" aria-hidden="true" className="size-7 rounded-md" height={28} priority src="/icon.svg" width={28} />
          <span className="whitespace-nowrap">{site.name}</span>
        </a>
        <nav aria-label={copy.label} className="mx-auto hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <a className="rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href={link.href} key={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-1 lg:flex">
          <LanguageMenu copy={copy} />
          <ThemeMenu copy={copy} />
          <Button asChild size="sm" variant="ghost">
            <a href={site.github} rel="noreferrer" target="_blank">
              <Github data-icon="inline-start" aria-hidden="true" />
              {copy.github}
            </a>
          </Button>
        </div>
        <div className="ml-auto lg:hidden">
          <MobileNav copy={copy} />
        </div>
      </PageFrame>
    </header>
  );
}
