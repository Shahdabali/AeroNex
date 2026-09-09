import { FareDataInput } from '../utils/validation';

export interface AirfareProvider {
  fetchLatestFares(): Promise<FareDataInput[]>;
}
