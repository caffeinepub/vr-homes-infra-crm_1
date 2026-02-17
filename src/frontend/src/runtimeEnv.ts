// Runtime environment shim to ensure Internet Identity provider URL is available
// This must be imported before any code that uses process.env.II_URL

// Ensure globalThis.process exists
if (typeof globalThis.process === 'undefined') {
  (globalThis as any).process = { env: {} };
}

// Ensure process.env exists
if (typeof globalThis.process.env === 'undefined') {
  globalThis.process.env = {};
}

// Set II_URL if not already set
// Priority: existing process.env.II_URL > import.meta.env.VITE_II_URL > official IC URL
if (!globalThis.process.env.II_URL) {
  if (import.meta.env.VITE_II_URL) {
    globalThis.process.env.II_URL = import.meta.env.VITE_II_URL;
  } else {
    // Fallback to official Internet Identity provider
    globalThis.process.env.II_URL = 'https://identity.ic0.app';
  }
}
