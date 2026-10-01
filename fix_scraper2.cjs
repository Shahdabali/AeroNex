const fs = require('fs');
let provider = fs.readFileSync('server/src/providers/PuppeteerAirfareProvider.ts', 'utf8');

provider = provider.replace(/const fares = await page\.evaluate\(\(originIata, destIata, dStr\) => \{/, 'const fares = await page.evaluate((originIata, destIata, dStr, leadDays) => {');

fs.writeFileSync('server/src/providers/PuppeteerAirfareProvider.ts', provider);
