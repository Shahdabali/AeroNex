const fs = require('fs');

let sidebar = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');
sidebar = sidebar.replace(/const unread = Array\.isArray\(notifications\).+?;\n/, '');
fs.writeFileSync('src/components/layout/Sidebar.tsx', sidebar);

let app = fs.readFileSync('src/App.tsx', 'utf8');

const patterns = [
    /<Route path="\/price-alerts" .+? \/>\n\s*/g,
    /<Route path="\/alerts" .+? \/>\n\s*/g,
    /<Route path="\/airlines" .+? \/>\n\s*/g,
    /<Route path="\/cpi-analytics" .+? \/>\n\s*/g,
    /<Route path="\/cpi" .+? \/>\n\s*/g,
    /<Route path="\/reports" .+? \/>\n\s*/g,
    /<Route path="\/ai-analytics" .+? \/>\n\s*/g
];

patterns.forEach(p => {
    app = app.replace(p, '');
});

fs.writeFileSync('src/App.tsx', app);
