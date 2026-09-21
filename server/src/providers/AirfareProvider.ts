import { FareDataInput } from '../utils/validation';
import type { DataMode } from '../services/ingestionMonitor';

export interface AirfareProvider {
  readonly name: string;
  readonly mode: DataMode;
  fetchLatestFares(): Promise<FareDataInput[]>;
}
