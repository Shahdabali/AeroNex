const fs = require('fs');

let sidebar = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

sidebar = sidebar.replace(/Plane, Calculator, Settings, Activity,\n\s*BookOpen, ShieldAlert, FileText, Brain/, 'Settings, Activity,\n  BookOpen');
sidebar = sidebar.replace(/const unread = Array\.isArray\(notifications\) \? notifications\.filter\(\(n: any\) => !n\.read\)\.length : 0;\n/, '');
sidebar = sidebar.replace(/\{item\.badge && \([\s\S]+?\}\)/g, ''); // remove badge rendering

fs.writeFileSync('src/components/layout/Sidebar.tsx', sidebar);

let app = fs.readFileSync('src/App.tsx', 'utf8');

const routes = ['PriceAlerts', 'AirlinesPage', 'CPIAnalytics', 'ReportsPage', 'AiAnalyticsPage'];
routes.forEach(r => {
    app = app.replace(new RegExp(`const ${r} = lazy.+;\r?\n`), '');
});

fs.writeFileSync('src/App.tsx', app);
