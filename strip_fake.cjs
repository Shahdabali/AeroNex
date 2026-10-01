const fs = require('fs');

let sidebar = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

const newNavItems = `  const navItems = [
    { icon: Home, label: 'Overview', path: '/dashboard' },
    { icon: LineChart, label: 'Airfare Index', path: '/airfare-index', badgeText: feedBadge },
    { icon: Activity, label: 'Data Pipeline', path: '/data-scraping' },
    { icon: Map, label: 'Routes', path: '/routes' },
    { icon: Search, label: 'Flight Search', path: '/search' },
    { icon: TrendingUp, label: 'Price Trends', path: '/price-trends' },
    { icon: BookOpen, label: 'Methodology', path: '/methodology' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];`;

sidebar = sidebar.replace(/const navItems = \[[\s\S]+?\];/, newNavItems);
fs.writeFileSync('src/components/layout/Sidebar.tsx', sidebar);

let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(/const PriceAlerts = lazy.+;\n/, '');
app = app.replace(/const AirlinesPage = lazy.+;\n/, '');
app = app.replace(/const CPIAnalytics = lazy.+;\n/, '');
app = app.replace(/const ReportsPage = lazy.+;\n/, '');
app = app.replace(/const AiAnalyticsPage = lazy.+;\n/, '');

app = app.replace(/<Route path="\/price-alerts".+\/>\n\s*/, '');
app = app.replace(/<Route path="\/alerts".+\/>\n\s*/, '');
app = app.replace(/<Route path="\/airlines".+\/>\n\s*/, '');
app = app.replace(/<Route path="\/cpi-analytics".+\/>\n\s*/, '');
app = app.replace(/<Route path="\/cpi".+\/>\n\s*/, '');
app = app.replace(/<Route path="\/reports".+\/>\n\s*/, '');
app = app.replace(/<Route path="\/ai-analytics".+\/>\n\s*/, '');

fs.writeFileSync('src/App.tsx', app);
