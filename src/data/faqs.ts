/** Shared help-center answers. Keep in sync with server/src/routes/supportRoutes.ts. */
export const FAQS = [
  {
    id: 1,
    category: 'Airfare Index',
    q: 'How is the AeroNex National Airfare Index calculated?',
    a: 'The index compares the fares currently observed on tracked domestic corridors against a fixed baseline basket (baseline = 100), similar in spirit to a CPI basket. See the Methodology page for the full formula.',
  },
  {
    id: 2,
    category: 'Data Freshness',
    q: 'How frequently is route pricing updated?',
    a: 'The ingestion worker refreshes on a fixed interval (30 seconds by default). The Data Pipeline page shows the active data source and the time of the last successful refresh.',
  },
  {
    id: 3,
    category: 'Predictions',
    q: 'How accurate are the AI price predictions?',
    a: 'Predictions are estimates derived from the fares AeroNex has observed and are not guarantees. Each recommendation lists the data it was based on and its caveats; treat them as decision support, not a forecast you can rely on.',
  },
  {
    id: 4,
    category: 'Price Alerts',
    q: 'How do price alerts reach me?',
    a: 'After each data refresh AeroNex compares observed fares with your targets. When a target is reached the alert is marked Triggered and a notification appears in the bell menu inside the app.',
  },
  {
    id: 5,
    category: 'Account & Security',
    q: 'Can I export my saved data?',
    a: 'Yes. In Settings, open Data & Privacy and choose "Download My Data" to get a JSON export of your profile, preferences and alerts.',
  },
];
