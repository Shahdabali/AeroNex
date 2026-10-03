const fs = require('fs');
let c = fs.readFileSync('src/components/LoginCard.tsx', 'utf8');
c = c.replace(/<a href="#"/g, '<span').replace(/<\/a>/g, '</span>');
fs.writeFileSync('src/components/LoginCard.tsx', c);
