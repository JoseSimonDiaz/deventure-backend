import { z } from 'zod';
import { idSchema, paginationSchema } from './common.js';
import { answerSchema } from './content.js';

export const SESSION_STATUSES = Object.freeze(['in_progress', 'won', 'lost', 'abandoned']);
export const sessionStatusSchema = z.enum(SESSION_STATUSES);

export const startSessionSchema = z.object({ levelId: idSchema });

export const sessionIdParamsSchema = z.object({ sessionId: idSchema });

export const updateSessionSchema = z.object({ status: z.literal('abandoned') });

export const attemptRequestSchema = z.object({
  challengeId: idSchema,
  answer: answerSchema,
});

export const hintRequestSchema = z.object({ challengeId: idSchema });

export const validatePreviewSchema = z.object({
  challenge: z.object({
    type: z.string(),
    language: z.string(),
    payload: z.record(z.unknown()),
    solution: z.record(z.unknown()),
    explanation: z.string().default(''),
    commonErrors: z.array(z.object({ pattern: z.string(), message: z.string() })).default([]),
  }),
  answer: answerSchema,
});

export const PENDING_CALL_STATUSES = Object.freeze(['pending', 'done', 'failed']);

export const pendingCallsQuerySchema = paginationSchema.extend({
  status: z.enum(PENDING_CALL_STATUSES).default('failed'),
});

export const ASSISTANT_QUESTION_MAX_LENGTH = 500;

const assistantQuestionTextSchema = z
  .string()
  .trim()
  .min(3, 'Escribí tu pregunta')
  .max(ASSISTANT_QUESTION_MAX_LENGTH);

export const assistantQuestionSchema = z.object({
  sessionId: idSchema,
  challengeId: idSchema,
  question: assistantQuestionTextSchema,
});

export const oracleQuestionSchema = z.object({ question: assistantQuestionTextSchema });
