import { setRequestLocale } from 'next-intl/server';

import { LandingPage } from '@/components/landing/landing-page';

export default function ChineseHomePage() {
  setRequestLocale('zh');

  return <LandingPage locale="zh" />;
}
