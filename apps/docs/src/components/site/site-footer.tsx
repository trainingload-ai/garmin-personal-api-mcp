import Image from 'next/image';

import { GridCrosses } from '@/components/landing/grid-crosses';
import { PageFrame } from '@/components/landing/page-frame';
import { Separator } from '@/components/ui/separator';
import { getLandingMessages } from '@/i18n/get-messages';
import type { Locale } from '@/lib/content/types';
import { localePath } from '@/lib/seo/url';
import { site } from '@/lib/site';

type FooterLink = { href: string; label: string; external?: boolean };

function FooterGroup({ id, title, links }: { id: string; title: string; links: FooterLink[] }) {
  return (
    <nav aria-labelledby={id}>
      <h3 className="text-sm font-semibold" id={id}>{title}</h3>
      <ul className="mt-4 flex flex-col gap-1">
        {links.map((link) => (
          <li key={link.href}>
            <a
              className="inline-flex min-h-8 items-center text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              href={link.href}
              rel={link.external ? 'noreferrer' : undefined}
              target={link.external ? '_blank' : undefined}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export async function SiteFooter({ locale }: { locale: Locale }) {
  const copy = (await getLandingMessages()).footer;
  const groups = [
    {
      id: 'footer-start',
      title: copy.start,
      links: [
        { href: '#how-it-works', label: copy.how },
        { href: '#quickstart', label: copy.quickstart },
        { href: '#clients', label: copy.clients },
      ],
    },
    {
      id: 'footer-data',
      title: copy.data,
      links: [
        { href: '#capabilities', label: copy.tools },
        { href: '#data', label: copy.dataGuide },
        { href: '#privacy', label: copy.privacy },
        { href: '#faq', label: copy.faq },
      ],
    },
    {
      id: 'footer-project',
      title: copy.project,
      links: [
        { href: site.github, label: copy.github, external: true },
        { href: site.npm, label: copy.npm, external: true },
        { href: site.agentInstructions, label: copy.contract, external: true },
        { href: `${site.github}/blob/main/SECURITY.md`, label: copy.security, external: true },
      ],
    },
  ] satisfies Array<{ id: string; title: string; links: FooterLink[] }>;

  return (
    <footer className="border-t border-border bg-surface">
      <PageFrame>
        <GridCrosses className="hidden sm:block" />
        <div className="grid lg:grid-cols-12">
          <div className="border-b border-border px-5 py-10 sm:px-8 lg:col-span-4 lg:border-r lg:border-b-0 lg:px-10 lg:py-14">
            <a className="inline-flex items-center gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href={localePath(locale, '#top')} aria-label={copy.home}>
              <Image alt="" aria-hidden="true" className="size-8 rounded-lg" height={32} src="/icon.svg" width={32} />
              <strong>{site.name}</strong>
            </a>
            <p className="mt-5 max-w-xs text-sm leading-6 text-muted-foreground">{copy.description}</p>
            <p className="mt-6 flex items-center gap-2 font-mono text-xs text-muted-foreground">
              <span aria-hidden="true" className="size-1.5 rounded-sm bg-primary" />
              {copy.status}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 px-5 py-10 sm:px-8 md:grid-cols-3 lg:col-span-8 lg:px-10 lg:py-14">
            {groups.map((group) => <FooterGroup key={group.id} {...group} />)}
          </div>
        </div>
        <Separator />
        <div className="flex flex-col gap-3 px-5 py-5 text-xs leading-5 text-muted-foreground sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <p>
            {copy.copyrightBefore}<a className="underline underline-offset-4 hover:text-foreground" href={`${site.github}/blob/main/LICENSE`}>{copy.license}</a>{copy.copyrightAfter}
          </p>
          <p className="max-w-2xl lg:text-right">{copy.trademark}</p>
        </div>
      </PageFrame>
    </footer>
  );
}
