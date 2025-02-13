import { z } from "zod"

export let apiKeySchema = z.object({
  id_api_key: z.string(),
  name: z.string(),
})

export type ApiKey = z.infer<typeof apiKeySchema>