import { ValidationError } from '@deventure/service-kit';

const WRONG_LINE_MESSAGE = 'El error no está en esa línea';
const WRONG_FIX_MESSAGE = 'Encontraste la línea, pero esa no es la corrección';

export function validateFindBug(challenge, answer) {
  if (answer.line >= challenge.payload.lines.length) {
    throw new ValidationError('Esa línea no existe en el código', { code: 'INVALID_LINE' });
  }
  if (answer.line !== challenge.solution.bugLine) {
    return { isCorrect: false, message: WRONG_LINE_MESSAGE, details: { isLineCorrect: false } };
  }
  if (answer.fixOptionId !== challenge.solution.fixOptionId) {
    return { isCorrect: false, message: WRONG_FIX_MESSAGE, details: { isLineCorrect: true } };
  }
  return { isCorrect: true };
}
