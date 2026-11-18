import { validationRepository } from '../repositories/validation.repository.js';

export async function validatePredictOutput(challenge, answer) {
  const outputComparison = await validationRepository.compareOutput({
    expectedOutput: challenge.solution.output,
    output: answer.output,
  });
  if (outputComparison.isCorrect) return { isCorrect: true };
  return {
    isCorrect: false,
    message: `La línea ${outputComparison.firstWrongLine} debería ser distinta`,
    details: { firstWrongLine: outputComparison.firstWrongLine },
  };
}
