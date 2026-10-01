const fs = require('fs');

let sidebar = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

const newNavItems = `  const navItems: Array<{ icon: any, label: string, path: string, badgeText?: string, badge?: number }> = [
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

sidebar = sidebar.replace(/Plane, Calculator, Settings, Activity,[\s\S]+?BookOpen, ShieldAlert, FileText, Brain/, 'Settings, Activity,\n  BookOpen');

fs.writeFileSync('src/components/layout/Sidebar.tsx', sidebar);
