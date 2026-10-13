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
