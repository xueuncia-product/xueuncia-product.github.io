import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    section: z.enum(['ai-learning', 'philosophy', 'methods', 'works', 'articles', 'ideas', 'videos', 'gallery']),
    summary: z.string().optional(),
    draft: z.boolean().default(false),
    private: z.boolean().default(false),
    source: z.enum(['original', 'sina']).default('original'),
  }),
});

export const collections = { posts };
