import { setRequestLocale } from 'next-intl/server';

import { LandingPage } from '@/components/landing/landing-page';

export default function EnglishHomePage() {
  setRequestLocale('en');

  return <LandingPage locale="en" />;
}
