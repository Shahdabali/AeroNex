import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');
  await page.goto('https://www.google.com/search?q=flights+from+DEL+to+BOM+tomorrow', {waitUntil: 'networkidle2'});
  await new Promise(r => setTimeout(r, 3000));
  const text = await page.evaluate(() => document.body.innerText);
  console.log(text.substring(0, 1000));
  console.log('Prices? :', text.match(/[\d,]{3,7}/g)); // just look for any numbers
  await browser.close();
})();
