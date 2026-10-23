'use client';

import { useEffect, useRef, useState } from 'react';

import type { LandingMessages } from '@/lib/content/types';

import { TerminalWindow } from './terminal-window';

const promptDuration = 1050;
const toolDuration = 800;
const answerDuration = 4000;

export function McpTerminalDemo({ copy }: { copy: LandingMessages['terminal'] }) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [stage, setStage] = useState(0);
  const scenario = copy.scenarios[scenarioIndex] ?? copy.scenarios[0]!;
  const answerStage = scenario.calls.length + 1;
  const visualStage = prefersReducedMotion ? answerStage : stage;

  useEffect(() => {
    const terminal = terminalRef.current;
    if (!terminal || typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry?.isIntersecting ?? false),
      { threshold: 0.18 },
    );
    observer.observe(terminal);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(media.matches);
    updatePreference();
    media.addEventListener('change', updatePreference);
    return () => media.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    const updateVisibility = () => setIsDocumentVisible(document.visibilityState === 'visible');
    updateVisibility();
    document.addEventListener('visibilitychange', updateVisibility);
    return () => document.removeEventListener('visibilitychange', updateVisibility);
  }, []);

  useEffect(() => {
    if (!isInView || !isDocumentVisible || prefersReducedMotion) return;

    const duration = stage === 0 ? promptDuration : stage >= answerStage ? answerDuration : toolDuration;
    const timeout = window.setTimeout(() => {
      if (stage >= answerStage) {
        setStage(0);
        setScenarioIndex((current) => (current + 1) % copy.scenarios.length);
        return;
      }
      setStage((current) => current + 1);
    }, duration);

    return () => window.clearTimeout(timeout);
  }, [answerStage, copy.scenarios.length, isDocumentVisible, isInView, prefersReducedMotion, stage]);

  return (
    <div className="terminal-dots min-w-0 p-3 sm:p-7 lg:p-8" ref={terminalRef}>
      <p className="sr-only">{copy.summary}</p>
      <TerminalWindow
        answerStage={answerStage}
        copy={copy}
        prefersReducedMotion={prefersReducedMotion}
        scenario={scenario}
        scenarioCount={copy.scenarios.length}
        scenarioIndex={scenarioIndex}
        visualStage={visualStage}
      />
    </div>
  );
}
