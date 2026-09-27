import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
  await page.goto('https://www.kayak.co.in/flights/DEL-BOM/2026-10-15?sort=price_a', {waitUntil: 'networkidle2'});
  const text = await page.evaluate(() => document.body.innerText);
  console.log(text.substring(0, 500));
  
  const priceMatches = text.match(/₹\s*[\d,]+/g) || [];
  console.log('Prices found:', priceMatches.slice(0, 5));
  await browser.close();
})();
