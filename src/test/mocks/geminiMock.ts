import { vi } from 'vitest';

export const mockGeminiSuccess = (responseText: string) => {
  return {
    models: {
      generateContent: vi.fn().mockResolvedValue({
        text: responseText,
      }),
    },
  };
};

export const mockGeminiError = (error: Error) => {
  return {
    models: {
      generateContent: vi.fn().mockRejectedValue(error),
    },
  };
};

export const mockGeminiTimeout = () => {
  return mockGeminiError(new Error('Request timeout'));
};

export const mockGeminiRateLimit = () => {
  const error = new Error('Rate limit exceeded') as any;
  error.status = 429;
  return mockGeminiError(error);
};

export const mockGeminiMalformedResponse = () => {
  return {
    models: {
      generateContent: vi.fn().mockResolvedValue({
        // Missing 'text' field
        data: 'some data',
      }),
    },
  };
};
