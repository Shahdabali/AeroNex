const fs = require('fs');

let sidebar = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

const itemsToRemove = ['Price Alerts', 'CPI Analytics', 'AI Analytics', 'Reports', 'Airlines'];

itemsToRemove.forEach(item => {
  const regex = new RegExp(`\\{ icon: [^,]+, label: '${item}', path: '[^']+'(?:, badge[^}]+)? \\},\\n\\s*`);
  sidebar = sidebar.replace(regex, '');
});

fs.writeFileSync('src/components/layout/Sidebar.tsx', sidebar);

let app = fs.readFileSync('src/App.tsx', 'utf8');

const routesToRemove = ['PriceAlerts', 'CPIAnalytics', 'ReportsPage', 'AiAnalyticsPage', 'AirlinesPage'];

routesToRemove.forEach(route => {
  app = app.replace(new RegExp(`\\s*<Route path="[^"]+" element=\\{<ProtectedRoute><${route} /><\\/ProtectedRoute>\\} \\/>\\n`, 'g'), '\n');
  app = app.replace(new RegExp(`\\s*const ${route} = lazy\\(\\(.*?\\);\\n`, 'g'), '\n');
});

app = app.replace(/\s*<Route path="\/alerts" element=\{<ProtectedRoute><PriceAlerts \/><\/ProtectedRoute>\} \/>\n/g, '\n');
app = app.replace(/\s*<Route path="\/cpi" element=\{<ProtectedRoute><CPIAnalytics \/><\/ProtectedRoute>\} \/>\n/g, '\n');

fs.writeFileSync('src/App.tsx', app);
