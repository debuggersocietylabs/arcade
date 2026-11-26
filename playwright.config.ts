import { defineConfig, devices } from '@playwright/test';

// Tests run against the production build (vite preview), exactly like GitHub Pages serves it.
export default defineConfig({
  testMatch: ['tests/e2e/**/*.spec.ts', 'games/**/*.e2e.ts'],
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: { baseURL: 'http://localhost:4173', trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Software WebGL so tests also pass on machines without a GPU (CI, cloud sandboxes).
        launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] },
      },
    },
  ],
});
