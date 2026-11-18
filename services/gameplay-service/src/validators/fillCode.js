import { ValidationError } from '@deventure/service-kit';
import { validationRepository } from '../repositories/validation.repository.js';
import { findBalanceProblem } from './codeBalance.js';
import { buildWrongAnswer } from './wrongAnswer.js';

const SYNTAX_MESSAGE = 'Revisá la sintaxis, algo no está bien escrito';
const BLANKS_SEPARATOR = '\n';
const NO_ITEMS = Object.freeze([]);

async function validateBlanks(challenge, answer) {
  if (answer.blanks.length === 0) {
    throw new ValidationError('Completá los huecos del código', { code: 'EMPTY_ANSWER' });
  }
  const answerText = answer.blanks.join(BLANKS_SEPARATOR);
  const blanksComparison = await validationRepository.compareBlanks({
    validBlanks: challenge.solution.blanks,
    blanks: answer.blanks,
    language: challenge.language,
  });
  if (blanksComparison.isCorrect) return { isCorrect: true };
  return buildWrongAnswer({
    challenge,
    answerText,
    defaultMessage: findBalanceProblem(answerText) || SYNTAX_MESSAGE,
    details: { firstWrongBlank: blanksComparison.firstWrongBlank },
  });
}

async function validateFreeCode(challenge, answer) {
  if (answer.code.trim().length === 0) {
    throw new ValidationError('Escribí tu código antes de comprobar', { code: 'EMPTY_ANSWER' });
  }
  const balanceProblem = findBalanceProblem(answer.code);
  if (balanceProblem) return { isCorrect: false, message: balanceProblem, details: {} };

  const codeComparison = await validationRepository.compareFreeCode({
    accepted: challenge.solution.accepted ?? NO_ITEMS,
    requiredTokens: challenge.solution.requiredTokens ?? NO_ITEMS,
    code: answer.code,
    language: challenge.language,
  });
  if (codeComparison.isCorrect) return { isCorrect: true };
  return buildWrongAnswer({ challenge, answerText: answer.code, defaultMessage: SYNTAX_MESSAGE });
}

const FILL_CODE_VALIDATORS = new Map([
  ['blanks', validateBlanks],
  ['free', validateFreeCode],
]);

export function validateFillCode(challenge, answer) {
  return FILL_CODE_VALIDATORS.get(challenge.payload.mode)(challenge, answer);
}
