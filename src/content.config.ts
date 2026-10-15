import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(), // <title> (50–60 chars)
    h1: z.string(), // visible question-shaped heading
    description: z.string(), // meta description (150–160 chars)
    question: z.string().min(5),
    answer: z.string().min(20), // rendered verbatim as the first paragraph
    data_asof: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    published: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    sources: z.array(z.object({ name: z.string(), url: z.string().url() })).min(1),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    tool: z.string().optional(), // related calculator path
    related: z.array(z.string()).default([]), // related guide slugs
    changelog: z.string().optional(),
    order: z.number().default(100),
  }),
});

export const collections = { guides };
