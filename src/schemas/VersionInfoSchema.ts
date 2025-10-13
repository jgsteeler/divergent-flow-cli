import { timeStamp } from 'node:console';
import { z } from 'zod';

export const VersionInfoSchema = z.object({
  version: z.string(),
  service: z.string().optional(),
  timestamp: z.string().optional(),
  // Add other fields as needed
});
