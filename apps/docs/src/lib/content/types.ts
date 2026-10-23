import type { routing } from '@/i18n/routing';

export type Locale = (typeof routing.locales)[number];

export type LandingMessages = {
  metadata: {
    title: string;
    description: string;
    keywords: string[];
  };
  common: {
    copy: string;
    copied: string;
  };
  skipToContent: string;
  nav: {
    label: string;
    how: string;
    quickstart: string;
    data: string;
    security: string;
    faq: string;
    github: string;
    home: string;
    language: string;
    theme: string;
    themeLight: string;
    themeDark: string;
    themeSystem: string;
    menu: string;
    menuDescription: string;
    close: string;
  };
  hero: {
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    description: string;
    start: string;
    source: string;
    commandLabel: string;
    trustLabel: string;
    trust: string[];
  };
  terminal: {
    summary: string;
    connected: string;
    demo: string;
    scenarios: Array<{
      question: string;
      calls: Array<[name: string, detail: string]>;
      answer: string;
    }>;
  };
  how: {
    kicker: string;
    title: string;
    description: string;
    flow: Array<{ index: string; title: string; description: string; meta: string }>;
    authKicker: string;
    authTitle: string;
    authDescription: string;
    facts: Array<[label: string, value: string]>;
  };
  quickstart: {
    kicker: string;
    title: string;
    description: string;
    keyTitle: string;
    keyDescription: string;
    keyLink: string;
    agentTitle: string;
    agentDescription: string;
    commandLabel: string;
    contractBefore: string;
    contractLink: string;
    contractAfter: string;
    localTitle: string;
    localDescriptionBefore: string;
    localDescriptionAfter: string;
    clientHandles: string;
    reloadTitle: string;
    reloadDescription: string;
    examplePrompt: string;
    docsBefore: string;
    docsCodex: string;
    docsClaude: string;
    docsCursor: string;
    docsOr: string;
    docsAfter: string;
  };
  clients: {
    kicker: string;
    title: string;
    description: string;
    transport: string;
    transportValue: string;
    protocol: string;
    protocolValue: string;
    verified: string;
    verifiedValue: string;
    note: string;
    tabsLabel: string;
    source: string;
    developmentOnly: string;
    windowsConfig: string;
  };
  capabilities: {
    kicker: string;
    title: string;
    description: string;
    groups: Array<{ index: string; title: string; description: string; tools: string[] }>;
    tryAsking: string;
    promptTitle: string;
    prompts: Array<[label: string, prompt: string]>;
  };
  data: {
    kicker: string;
    title: string;
    description: string;
    topics: Array<{ index: string; title: string; body: string; examples: string[] }>;
    examplesLabel: string;
  };
  privacy: {
    kicker: string;
    title: string;
    description: string;
    link: string;
    boundaries: Array<[title: string, description: string]>;
  };
  faq: {
    kicker: string;
    title: string;
    description: string;
    answers: string;
    items: Array<{ question: string; answer: string }>;
  };
  finalCta: {
    kicker: string;
    titleLineOne: string;
    titleLineTwo: string;
    description: string;
    commandLabel: string;
    steps: string;
    github: string;
  };
  footer: {
    description: string;
    status: string;
    start: string;
    how: string;
    quickstart: string;
    clients: string;
    data: string;
    tools: string;
    dataGuide: string;
    privacy: string;
    faq: string;
    project: string;
    github: string;
    npm: string;
    contract: string;
    security: string;
    copyrightBefore: string;
    license: string;
    copyrightAfter: string;
    trademark: string;
    home: string;
  };
};
