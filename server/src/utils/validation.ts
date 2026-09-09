import { z } from 'zod';

export const fareDataSchema = z.object({
  flight_number: z.string().min(1),
  airline_code: z.string().length(2),
  origin_iata: z.string().length(3),
  destination_iata: z.string().length(3),
  fare_amount: z.number().positive(),
  currency: z.string().length(3).default('INR'),
  departure_time: z.string().datetime(), // ISO string
  arrival_time: z.string().datetime(),
  source: z.string(),
});

export type FareDataInput = z.infer<typeof fareDataSchema>;

export function validateFareData(data: any): FareDataInput {
  return fareDataSchema.parse(data);
}
