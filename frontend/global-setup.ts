import { chromium } from '@playwright/test';

async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Wait for backend to be ready
  const backendUrl = 'http://localhost:8080/health';
  for (let i = 0; i < 30; i++) {
    try {
      const response = await page.goto(backendUrl);
      if (response?.ok()) {
        console.log('Backend is ready');
        break;
      }
    } catch {
      // retry
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Wait for frontend to be ready
  const frontendUrl = 'http://localhost:3000';
  for (let i = 0; i < 30; i++) {
    try {
      const response = await page.goto(frontendUrl);
      if (response?.ok()) {
        console.log('Frontend is ready');
        break;
      }
    } catch {
      // retry
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  await browser.close();
}

export default globalSetup;