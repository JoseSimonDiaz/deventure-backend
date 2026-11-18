import { ValidationError } from '@deventure/service-kit';
import { validationRepository } from '../repositories/validation.repository.js';
import { buildWrongAnswer } from './wrongAnswer.js';

const WRONG_OPTION_MESSAGE = 'Esa no es la respuesta correcta. ¡Probá de nuevo!';

export async function validateMultipleChoice(challenge, answer) {
  const isKnownOption = await validationRepository.hasOption(
    challenge.payload.options,
    answer.optionId,
  );
  if (!isKnownOption) {
    throw new ValidationError('La opción elegida no existe', { code: 'INVALID_OPTION' });
  }
  if (answer.optionId === challenge.solution.correctOptionId) return { isCorrect: true };
  return buildWrongAnswer({
    challenge,
    answerText: answer.optionId,
    defaultMessage: WRONG_OPTION_MESSAGE,
  });
}
