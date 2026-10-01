import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
  const date = new Date();
  date.setDate(date.getDate() + 2);
  const emtDate = date.toISOString().split('T')[0].split('-').reverse().join('/');
  console.log('Date:', emtDate);
  const url = `https://flight.easemytrip.com/FlightList/Index?srch=DEL-Delhi-India|BOM-Mumbai-India|${emtDate}&px=1-0-0&cbn=0&ar=undefined&isow=true&isdst=false&isrf=true`;
  console.log('URL:', url);
  await page.goto(url, {waitUntil: 'domcontentloaded'});
  await new Promise(r => setTimeout(r, 15000));
  const text = await page.evaluate(() => document.body.innerText);
  const matches = text.match(/(?:\u20B9|\$)\s*[\d,]+/g) || [];
  console.log('Matches:', matches.slice(0, 10));
  await browser.close();
})();
