import '@testing-library/jest-dom';
import { afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock environment variables
beforeAll(() => {
  vi.stubEnv('VITE_GEMINI_API_KEY', 'test-gemini-key-12345');
  vi.stubEnv('VITE_GOOGLE_API_KEY', 'test-google-key-12345');
});

// Mock Web Speech API
global.speechSynthesis = {
  getVoices: vi.fn(() => []),
  speak: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  speaking: false,
  pending: false,
  paused: false,
  onvoiceschanged: null,
} as any;

global.SpeechSynthesisUtterance = vi.fn().mockImplementation(() => ({
  text: '',
  lang: '',
  voice: null,
  volume: 1,
  rate: 1,
  pitch: 1,
  onstart: null,
  onend: null,
  onerror: null,
  onpause: null,
  onresume: null,
  onmark: null,
  onboundary: null,
})) as any;
