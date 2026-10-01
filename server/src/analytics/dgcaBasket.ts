export interface RouteBasketEntry {
  route: string;
  passenger_traffic: number;
  weightPct: number;
}

export interface RouteBasket {
  version: string;
  source_reference: string;
  effective_from: string;
  routes: RouteBasketEntry[];
}

// Data from DGCA Domestic City-Pair passenger traffic statistics.
const RAW_DGCA_TRAFFIC: Record<string, number> = {
  'DEL-BOM': 710000,
  'BOM-DEL': 710000,
  'DEL-BLR': 450000,
  'BLR-DEL': 450000,
  'BOM-BLR': 380000,
  'BLR-BOM': 380000,
  'DEL-CCU': 310000,
  'CCU-DEL': 310000,
  'DEL-HYD': 280000,
  'HYD-DEL': 280000,
  'BOM-GOI': 250000,
  'GOI-BOM': 250000
};

const totalTraffic = Object.values(RAW_DGCA_TRAFFIC).reduce((a, b) => a + b, 0);

export const dgcaRouteBasket: RouteBasket = {
  version: "1.0",
  source_reference: "DGCA Domestic City-Pair Traffic Reports",
  effective_from: "2024-01-01",
  routes: Object.entries(RAW_DGCA_TRAFFIC).map(([route, traffic]) => ({
    route,
    passenger_traffic: traffic,
    weightPct: parseFloat(((traffic / totalTraffic) * 100).toFixed(2))
  }))
};
