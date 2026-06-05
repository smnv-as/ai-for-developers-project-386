import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html', { outputFolder: 'playwright-report' }], ['list']],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  globalSetup: './global-setup.ts',
  globalTeardown: './global-teardown.ts',

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: [
    {
      command: 'cd ../backend && go run ./cmd/server',
      port: 8080,
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
      env: {
        PORT: '8080',
        DB_PATH: ':memory:',
        SEED_DATA: 'true',
        CORS_ALLOW_ORIGINS: '*',
      },
    },
    {
      command: 'npm run dev',
      port: 3000,
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
      env: {
        VITE_USE_MOCK: 'false',
        VITE_API_URL: '/api',
      },
    },
  ],
});