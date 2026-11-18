import { ValidationError } from '@deventure/service-kit';
import { validationRepository } from '../repositories/validation.repository.js';
import { buildWrongAnswer } from './wrongAnswer.js';

const WRONG_ORDER_MESSAGE = 'Revisá el orden de las líneas';
const ORDER_SEPARATOR = ',';

export async function validateOrderBlocks(challenge, answer) {
  const blockComparison = await validationRepository.compareBlockOrder({
    blocks: challenge.payload.blocks,
    validOrders: challenge.solution.validOrders,
    order: answer.order,
  });
  if (!blockComparison.isComplete) {
    throw new ValidationError('Faltan bloques o hay bloques repetidos', {
      code: 'INCOMPLETE_ORDER',
    });
  }
  if (blockComparison.isCorrect) return { isCorrect: true };
  return buildWrongAnswer({
    challenge,
    answerText: answer.order.join(ORDER_SEPARATOR),
    defaultMessage: WRONG_ORDER_MESSAGE,
    details: { firstWrongIndex: blockComparison.firstWrongIndex },
  });
}
