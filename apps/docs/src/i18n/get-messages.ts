import { getMessages } from 'next-intl/server';

import type { LandingMessages } from '@/lib/content/types';

export async function getLandingMessages(): Promise<LandingMessages> {
  return (await getMessages()) as unknown as LandingMessages;
}
