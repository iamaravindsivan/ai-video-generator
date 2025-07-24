import { z } from "zod";

export const DealerDbSchema = z.object({
  dealerId: z.string(),
  name: z.string(),
  inventoryUrl: z.string().optional(),
  dataSource: z.string().optional(),
  status: z.string().optional(),
  listingCount: z.number().optional(),
  dealerType: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zip: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  phone: z.string().optional(),
  createdAt: z.date(),
  marketCheckCreatedAt: z.date().optional(),
});

export type DealerDb = z.infer<typeof DealerDbSchema>;
