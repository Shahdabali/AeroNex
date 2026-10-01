const fs = require('fs');
let content = fs.readFileSync('src/components/LoginCard.tsx', 'utf8');

content = content.replace(/const \[showGuestMode, setShowGuestMode\].+?;[\r\n]+/g, '');
content = content.replace(/const \[guestName, setGuestName\].+?;[\r\n]+/g, '');

fs.writeFileSync('src/components/LoginCard.tsx', content);
