const fs = require('fs');
let c = fs.readFileSync('server/src/routes/flightRoutes.ts', 'utf8');
c = c.replace(/seatsLeft: Math\.floor\(Math\.random\(\) \* 5\) \+ 1/g, 'seatsLeft: null');
fs.writeFileSync('server/src/routes/flightRoutes.ts', c);
