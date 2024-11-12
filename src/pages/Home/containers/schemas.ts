import { z } from "zod"

export const formSchema = z.object({
  state: z.enum(['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'], {
    errorMap: () => ({ message: 'Please select a state' }),
  }),
  location: z.string(),
  workplaceName: z.string().min(1, 'Workplace name is required'),
  jobTitle: z.string().min(2, 'Job title is required'), 
  lastYearWorked: z.preprocess((val) => Number(val), z.number().min(1900, 'Please enter a valid year').max(new Date().getFullYear(), 'Year cannot be in the future')),
  comment: z.string().min(2, 'Comment is required').max(3000)
})

export type FormSchema = z.infer<typeof formSchema> 