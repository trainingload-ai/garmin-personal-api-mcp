import type { Locale } from '@/lib/content/types';
import { serializeStructuredData } from '@/lib/seo/structured-data';

import { Capabilities } from './capabilities';
import { ClientConfig } from './client-config';
import { DataGuide } from './data-guide';
import { FAQ } from './faq';
import { FinalCta } from './final-cta';
import { Hero } from './hero';
import { HowItWorks } from './how-it-works';
import { Privacy } from './privacy';
import { ProjectFacts } from './project-facts';
import { Quickstart } from './quickstart';

export function LandingPage({ locale }: { locale: Locale }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeStructuredData(locale) }} />
      <Hero locale={locale} />
      <HowItWorks />
      <ProjectFacts />
      <Quickstart />
      <ClientConfig />
      <Capabilities />
      <DataGuide />
      <Privacy />
      <FAQ />
      <FinalCta />
    </>
  );
}
