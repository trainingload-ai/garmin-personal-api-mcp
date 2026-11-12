import en from '../../messages/en.json';
import pt from '../../messages/pt.json';
import zh from '../../messages/zh.json';
import type { LandingMessages, Locale } from '@/lib/content/types';

const localizedMessages = { en, zh, pt } as unknown as Record<Locale, LandingMessages>;

export function getMessagesForLocale(locale: Locale): LandingMessages {
  return localizedMessages[locale];
}
