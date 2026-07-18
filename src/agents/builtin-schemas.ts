import { z } from 'zod';

export const narrativeSchema = z.object({
  text: z.string().trim().min(1),
  keyPoints: z.array(z.string()),
});

export const reviewSchema = z.object({
  score: z.number().min(0).max(10),
  findings: z.array(z.string()),
  recommendation: z.string().min(1),
});

export const planSchema = z.object({
  objective: z.string().min(1),
  steps: z.array(z.string()).min(1),
  risks: z.array(z.string()),
});

export const analysisSchema = z.object({
  wordCount: z.number().int().nonnegative(),
  sentenceCount: z.number().int().nonnegative(),
  keyTerms: z.array(z.string()),
  findings: z.array(z.string()),
});

export const dataAnalysisSchema = z.object({
  rows: z.number().int().nonnegative(),
  numericColumns: z.record(
    z.object({
      count: z.number().int().nonnegative(),
      minimum: z.number(),
      maximum: z.number(),
      mean: z.number(),
    })
  ),
  findings: z.array(z.string()),
  visualizationSuggestions: z.array(z.string()),
});

export const decisionSchema = z.object({
  selectedAction: z.string().min(1),
  rationale: z.string().min(1),
  confidence: z.number().min(0).max(1),
});
