export function generateDemoData() {
  // Generate historical chart data
  const chartData = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 60; j += 15) {
      const time = new Date(start.getTime() + (i * 60 + j) * 60000);
      const val = 100 + Math.sin(i / 3) * 15 + Math.cos(j / 10) * 5 + Math.random() * 5;
      chartData.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        value: parseFloat(val.toFixed(1))
      });
    }
  }

  return {
    metrics: {
      airfareIndex: { value: 124.8, change: 3.7 },
      averageFare: { value: 5240, change: 2.1 },
      flightsTracked: { value: 125420, change: 12.4 },
      routesTracked: { value: 1250, change: 8.6 },
      secondary: {
        lowestFare: { fare: 1899, route: 'BLR → CCU' },
        highestFare: { fare: 24500, route: 'DEL → BOM' },
        biggestIncrease: { change: 32.4, route: 'DEL → GOI' },
        biggestDecrease: { change: -18.7, route: 'BOM → HYD' },
      }
    },
    topRoutes: [
      { route: 'DEL → BOM', currentFare: 5420, change: 12.4 },
      { route: 'BOM → BLR', currentFare: 4860, change: 8.7 },
      { route: 'DEL → BLR', currentFare: 6230, change: 6.1 },
      { route: 'MAA → DEL', currentFare: 4150, change: -5.3 },
      { route: 'HYD → DEL', currentFare: 5780, change: -3.9 },
    ],
    regionalIndices: [
      { region: 'North', value: 118.6, change: 2.3 },
      { region: 'West', value: 124.2, change: 3.1 },
      { region: 'East', value: 112.7, change: 1.8 },
      { region: 'South', value: 131.5, change: 4.2 },
    ],
    chartData,
    aiInsights: [
      {
        id: '1',
        title: 'High Fares on Trunk Route',
        content: 'Fares are 12% higher on Delhi-Mumbai route compared to last week.',
        type: 'alert'
      },
      {
        id: '2',
        title: 'Booking Window',
        content: 'Best time to book for BOM-BLR is 18-25 days in advance.',
        type: 'recommendation'
      },
      {
        id: '3',
        title: 'Regional Trend',
        content: 'South India routes are currently most expensive (Index 131.5).',
        type: 'insight'
      },
      {
        id: '4',
        title: 'Market Overview',
        content: 'Airfare index is 3.7% higher than last week.',
        type: 'summary'
      }
    ]
  };
}
