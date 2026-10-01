import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');
  await page.goto('https://www.google.com/search?q=cheap+flights+from+DEL+to+BOM+tomorrow&hl=en', {waitUntil: 'domcontentloaded'});
  await new Promise(r => setTimeout(r, 3000));
  const text = await page.evaluate(() => document.body.innerText);
  
  // Google shows INR as ₹
  const matches = text.match(/(?:\u20B9|Rs\.?|INR)\s*[\d,]+/gi) || [];
  console.log('Matches:', matches.slice(0, 15));
  
  await browser.close();
})();
