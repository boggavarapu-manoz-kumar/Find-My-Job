import '@testing-library/jest-dom';

// Polyfill IntersectionObserver for jsdom test environments
global.IntersectionObserver = class IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  unobserve() {}
};

// Polyfill scrollTo for jsdom test environments
window.scrollTo = () => {};
