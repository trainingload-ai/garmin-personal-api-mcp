'use client';

import { Github, Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import type { LandingMessages } from '@/lib/content/types';
import { site } from '@/lib/site';

import { LanguageMenu } from './language-menu';
import { ThemeMenu } from './theme-menu';

export function MobileNav({ copy }: { copy: LandingMessages['nav'] }) {
  const links = [
    { href: '#how-it-works', label: copy.how },
    { href: '#quickstart', label: copy.quickstart },
    { href: '#data', label: copy.data },
    { href: '#privacy', label: copy.security },
    { href: '#faq', label: copy.faq },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button aria-label={copy.menu} className="lg:hidden" size="icon" variant="ghost">
          <Menu aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[min(90vw,24rem)]" closeLabel={copy.close} side="right">
        <SheetHeader className="border-b border-border px-5 py-5 text-left">
          <SheetTitle>{copy.menu}</SheetTitle>
          <SheetDescription>{copy.menuDescription}</SheetDescription>
        </SheetHeader>
        <nav aria-label={copy.label} className="flex flex-col gap-1 px-3">
          {links.map((link) => (
            <SheetClose asChild key={link.href}>
              <a className="rounded-lg px-3 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" href={link.href}>
                {link.label}
              </a>
            </SheetClose>
          ))}
        </nav>
        <Separator />
        <div className="flex items-center gap-2 px-4">
          <LanguageMenu copy={copy} />
          <ThemeMenu copy={copy} />
        </div>
        <div className="mt-auto border-t border-border p-4">
          <Button asChild className="w-full" variant="outline">
            <a href={site.github} rel="noreferrer" target="_blank">
              <Github data-icon="inline-start" aria-hidden="true" />
              {copy.github}
            </a>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
