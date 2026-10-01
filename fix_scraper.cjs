const fs = require('fs');

let provider = fs.readFileSync('server/src/providers/PuppeteerAirfareProvider.ts', 'utf8');

const replacement = `
    const LEAD_TIMES = [1, 7, 15, 30, 45];
    const leadDays = LEAD_TIMES[this.routeIndex % LEAD_TIMES.length];
    
    const date = new Date();
    date.setDate(date.getDate() + leadDays);
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
`;

provider = provider.replace(/\/\/ Fetch flights for 2 days from today[\s\S]+?const dateStr = date\.toISOString\(\)\.split\('T'\)\[0\]; \/\/ YYYY-MM-DD/, replacement);

provider = provider.replace(/fare_amount: price,/g, 'fare_amount: price, lead_days: leadDays,');
// In the evaluate block, leadDays needs to be passed down!
provider = provider.replace(/const fares = await page\.evaluate\(\(originIata, destIata, dateString\) => \{/g, 'const fares = await page.evaluate((originIata, destIata, dateString, leadDays) => {');
provider = provider.replace(/\}, origin, dest, dateStr\);/g, '}, origin, dest, dateStr, leadDays);');

fs.writeFileSync('server/src/providers/PuppeteerAirfareProvider.ts', provider);

let validation = fs.readFileSync('server/src/utils/validation.ts', 'utf8');
validation = validation.replace(/source: z\.string\(\),/g, 'source: z.string(),\n  lead_days: z.number().optional(),');
fs.writeFileSync('server/src/utils/validation.ts', validation);
