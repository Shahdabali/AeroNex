const fs = require('fs');
let content = fs.readFileSync('src/pages/AirfareIndex.tsx', 'utf8');

content = content.replace(/Weight is each corridor&apos;s share of the total baseline fare\./, "Weight is derived from official DGCA domestic passenger traffic statistics.");

content = content.replace(/Index = \(∑ current fares \/ ∑ baseline fares\) \* 100/g, "Index = ∑ (Current Fare / Base Fare) × Traffic Weight");

content = content.replace(/Each corridor&apos;s weight is its baseline fare divided by the total baseline\./, "Each corridor's weight corresponds to its DGCA passenger volume share.");

fs.writeFileSync('src/pages/AirfareIndex.tsx', content);
