import { setRequestLocale } from 'next-intl/server';

import { LandingPage } from '@/components/landing/landing-page';

export default function PortugueseHomePage() {
  setRequestLocale('pt');

  return <LandingPage locale="pt" />;
}
