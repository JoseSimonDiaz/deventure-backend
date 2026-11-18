import { z } from 'zod';
import { idSchema } from './common.js';

export const CHALLENGE_TYPES = Object.freeze([
  'multiple_choice',
  'order_blocks',
  'fill_code',
  'find_bug',
  'predict_output',
]);
export const CHALLENGE_LANGUAGES = Object.freeze(['pseudo', 'csharp', 'sql']);

export const MULTIPLE_CHOICE_MIN_OPTIONS = 2;
export const MULTIPLE_CHOICE_MAX_OPTIONS = 6;
export const OPTION_ID_MAX_LENGTH = 40;

export const challengeTypeSchema = z.enum(CHALLENGE_TYPES);
export const challengeLanguageSchema = z.enum(CHALLENGE_LANGUAGES);

export const zoneIdParamsSchema = z.object({ zoneId: idSchema });
export const levelIdParamsSchema = z.object({ levelId: idSchema });
export const challengeIdParamsSchema = z.object({ challengeId: idSchema });

const optionIdSchema = z.string().min(1).max(OPTION_ID_MAX_LENGTH);

export const multipleChoicePayloadSchema = z.object({
  options: z
    .array(z.object({ id: optionIdSchema, text: z.string().min(1) }))
    .min(MULTIPLE_CHOICE_MIN_OPTIONS)
    .max(MULTIPLE_CHOICE_MAX_OPTIONS),
});

export const multipleChoiceSolutionSchema = z.object({
  correctOptionId: optionIdSchema,
});

export const HINTS_MAX_PER_CHALLENGE = 3;
export const CODE_MAX_LENGTH = 2000;
export const BLOCKS_MAX = 30;
export const BLANKS_MAX = 20;
export const BLANK_MAX_LENGTH = 200;
export const FILL_CODE_MODES = Object.freeze(['blanks', 'free']);

export const hintParamsSchema = z.object({
  challengeId: idSchema,
  hintOrder: z.coerce.number().int().min(1).max(HINTS_MAX_PER_CHALLENGE),
});

const blockIdSchema = z.string().min(1).max(OPTION_ID_MAX_LENGTH);

export const orderBlocksPayloadSchema = z.object({
  blocks: z
    .array(z.object({ id: blockIdSchema, code: z.string().min(1) }))
    .min(2)
    .max(BLOCKS_MAX),
  expectedOutput: z.string().optional(),
});

export const orderBlocksSolutionSchema = z.object({
  validOrders: z.array(z.array(blockIdSchema).min(2)).min(1),
});

export const fillCodePayloadSchema = z.discriminatedUnion('mode', [
  z.object({ mode: z.literal('blanks'), template: z.string().min(1) }),
  z.object({ mode: z.literal('free'), starterCode: z.string().default('') }),
]);

export const fillCodeSolutionSchema = z.object({
  blanks: z
    .array(z.array(z.string().min(1)).min(1))
    .max(BLANKS_MAX)
    .optional(),
  accepted: z.array(z.string().min(1)).optional(),
  requiredTokens: z.array(z.string().min(1)).optional(),
});

export const findBugPayloadSchema = z.object({
  lines: z.array(z.string()).min(1),
  fixOptions: z
    .array(z.object({ id: optionIdSchema, text: z.string().min(1) }))
    .min(MULTIPLE_CHOICE_MIN_OPTIONS)
    .max(MULTIPLE_CHOICE_MAX_OPTIONS),
});

export const findBugSolutionSchema = z.object({
  bugLine: z.number().int().min(0),
  fixOptionId: optionIdSchema,
});

export const predictOutputPayloadSchema = z.object({ code: z.string().min(1) });

export const predictOutputSolutionSchema = z.object({ output: z.string() });

export const commonErrorSchema = z.object({
  pattern: z.string().min(1).max(200),
  message: z.string().min(1).max(200),
});

export const answerSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('multiple_choice'), optionId: optionIdSchema }),
  z.object({
    type: z.literal('order_blocks'),
    order: z.array(blockIdSchema).min(1).max(BLOCKS_MAX),
  }),
  z.object({
    type: z.literal('fill_code'),
    code: z.string().max(CODE_MAX_LENGTH).default(''),
    blanks: z.array(z.string().max(BLANK_MAX_LENGTH)).max(BLANKS_MAX).default([]),
  }),
  z.object({
    type: z.literal('find_bug'),
    line: z.number().int().min(0),
    fixOptionId: optionIdSchema,
  }),
  z.object({ type: z.literal('predict_output'), output: z.string().max(CODE_MAX_LENGTH) }),
]);

export const ZONE_SLUG_MAX_LENGTH = 50;
export const LEVEL_LIVES_MIN = 1;
export const LEVEL_LIVES_MAX = 5;

const SECURE_URL_PREFIX = 'https://';
const VIDEO_URL_MAX_LENGTH = 500;

const zoneFieldsSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(ZONE_SLUG_MAX_LENGTH)
    .regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().min(1),
  videoUrl: z
    .string()
    .url()
    .startsWith(SECURE_URL_PREFIX, 'El video tiene que estar en una dirección https://')
    .max(VIDEO_URL_MAX_LENGTH)
    .nullable()
    .default(null),
  theorySummary: z.string().min(1),
  isPublished: z.boolean().default(false),
});

export const zoneCreateSchema = zoneFieldsSchema;

export const zoneUpdateSchema = zoneFieldsSchema
  .partial()
  .extend({ isArchived: z.boolean().optional() })
  .strict();

export const levelCreateSchema = z.object({
  title: z.string().trim().min(2).max(120),
  initialLives: z.number().int().min(LEVEL_LIVES_MIN).max(LEVEL_LIVES_MAX).default(3),
  isPublished: z.boolean().default(false),
});

export const levelUpdateSchema = levelCreateSchema.partial().strict();

export const levelOrderSchema = z.object({ levelIds: z.array(idSchema).min(1) });

const challengeContentFields = {
  language: challengeLanguageSchema,
  statement: z.string().min(1),
  explanation: z.string().min(1),
  commonErrors: z.array(commonErrorSchema).max(20).default([]),
  hints: z.array(z.string().min(1)).max(HINTS_MAX_PER_CHALLENGE).default([]),
};

export const challengeWriteSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('multiple_choice'),
    payload: multipleChoicePayloadSchema,
    solution: multipleChoiceSolutionSchema,
    ...challengeContentFields,
  }),
  z.object({
    type: z.literal('order_blocks'),
    payload: orderBlocksPayloadSchema,
    solution: orderBlocksSolutionSchema,
    ...challengeContentFields,
  }),
  z.object({
    type: z.literal('fill_code'),
    payload: fillCodePayloadSchema,
    solution: fillCodeSolutionSchema,
    ...challengeContentFields,
  }),
  z.object({
    type: z.literal('find_bug'),
    payload: findBugPayloadSchema,
    solution: findBugSolutionSchema,
    ...challengeContentFields,
  }),
  z.object({
    type: z.literal('predict_output'),
    payload: predictOutputPayloadSchema,
    solution: predictOutputSolutionSchema,
    ...challengeContentFields,
  }),
]);

export const challengePreviewSchema = z.object({
  challenge: challengeWriteSchema,
  answer: answerSchema,
});
