'use client';

import { Check, Languages } from 'lucide-react';
import { useLocale } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePathname, useRouter } from '@/i18n/navigation';
import type { LandingMessages } from '@/lib/content/types';

const localeOptions = [
  { value: 'en', label: 'English', shortLabel: 'EN' },
  { value: 'zh', label: '简体中文', shortLabel: '简中' },
] as const;

export function LanguageMenu({ copy }: { copy: LandingMessages['nav'] }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const current = localeOptions.find((option) => option.value === locale) ?? localeOptions[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-label={copy.language} size="sm" variant="ghost">
          <Languages data-icon="inline-start" aria-hidden="true" />
          {current.shortLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuLabel>{copy.language}</DropdownMenuLabel>
        <DropdownMenuGroup>
          {localeOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => {
                router.replace(`${pathname}${window.location.hash}`, { locale: option.value });
              }}
            >
              <span className="flex-1">{option.label}</span>
              {option.value === locale ? <Check aria-hidden="true" /> : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
