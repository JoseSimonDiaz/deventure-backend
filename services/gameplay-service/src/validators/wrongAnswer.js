import { validationRepository } from '../repositories/validation.repository.js';

export async function buildWrongAnswer({ challenge, answerText, defaultMessage, details = {} }) {
  const commonError = await validationRepository.findFirstCommonError({
    commonErrors: challenge.commonErrors,
    answerText,
  });
  if (!commonError) return { isCorrect: false, message: defaultMessage, details };
  return {
    isCorrect: false,
    message: commonError.message,
    details: { ...details, line: commonError.line },
  };
}
