import z from 'zod';

const getRecordsSchema = z.object({
  query: z.object({
    currentPage: z.coerce.number().min(0, 'page should be at least 0'),
    pageSize: z.coerce
      .number()
      .min(0, 'page size should be at least 1')
      .max(50, 'maximum page size is 50'),
  }),
});

type GetRecordsTypes = z.infer<typeof getRecordsSchema>['query'];

export { getRecordsSchema, GetRecordsTypes };
