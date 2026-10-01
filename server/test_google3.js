import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');
  
  console.log('Loading Google Flights...');
  await page.goto('https://www.google.com/travel/flights?q=flights+from+DEL+to+BOM+tomorrow&hl=en', {waitUntil: 'domcontentloaded'});
  
  console.log('Waiting 5s...');
  await new Promise(r => setTimeout(r, 5000));
  
  const text = await page.evaluate(() => document.body.innerText);
  
  console.log('Searching for INR (₹) prices...');
  const matches = text.match(/(?:\u20B9|Rs\.?|INR)\s*[\d,]+/gi) || [];
  
  // also let's just find ANY numbers greater than 1000 with a comma
  const allNumbers = text.match(/\b\d{1,2},\d{3}\b/g) || [];
  
  console.log('Currency Matches:', matches.slice(0, 15));
  console.log('All big numbers:', Array.from(new Set(allNumbers)).slice(0, 15));
  
  await browser.close();
})();
