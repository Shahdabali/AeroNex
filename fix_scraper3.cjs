const fs = require('fs');

let provider = fs.readFileSync('server/src/providers/PuppeteerAirfareProvider.ts', 'utf8');

provider = provider.replace(/public generateFallbackFares\(route: string, origin: string, dest: string, dateStr: string\): FareDataInput\[\] \{/, 'public generateFallbackFares(route: string, origin: string, dest: string, dateStr: string, leadDays?: number): FareDataInput[] {');

provider = provider.replace(/return this\.generateFallbackFares\(route, origin, dest, dateStr\);/g, 'return this.generateFallbackFares(route, origin, dest, dateStr, typeof leadDays !== "undefined" ? leadDays : undefined);');

provider = provider.replace(/const emtDate = dateStr\.split\('-'\)\.reverse\(\)\.join\('\/'\); \/\/ DD\/MM\/YYYY\n    const url = `https:\/\/flight\.easemytrip\.com\/FlightList\/Index\?srch=\$\{origin\}-1\|\$\{dest\}-1\|\$\{emtDate\}&px=1-0-0&cbn=0&ar=undefined&isow=true&isdst=false&isrf=true`;\n    console\.log\(`\[Scraper\] Fetching ON-DEMAND fares for \$\{route\} at \$\{url\}`\);/, `const emtDate = dateStr.split('-').reverse().join('/'); // DD/MM/YYYY
    const url = \`https://flight.easemytrip.com/FlightList/Index?srch=\${origin}-1|\${dest}-1|\${emtDate}&px=1-0-0&cbn=0&ar=undefined&isow=true&isdst=false&isrf=true\`;
    const leadDays = Math.max(1, Math.round((new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 3600 * 24)));
    console.log(\`[Scraper] Fetching ON-DEMAND fares for \${route} at \${url}\`);`);

// Fix generateFallbackFares payload
provider = provider.replace(/fare_amount: finalPrice,\n        currency: 'INR',/g, 'fare_amount: finalPrice, lead_days: leadDays,\n        currency: \'INR\',');


fs.writeFileSync('server/src/providers/PuppeteerAirfareProvider.ts', provider);
