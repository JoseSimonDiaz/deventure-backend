import { validateFillCode } from './fillCode.js';
import { validateFindBug } from './findBug.js';
import { validateMultipleChoice } from './multipleChoice.js';
import { validateOrderBlocks } from './orderBlocks.js';
import { validatePredictOutput } from './predictOutput.js';

export const VALIDATORS = new Map([
  ['multiple_choice', validateMultipleChoice],
  ['order_blocks', validateOrderBlocks],
  ['fill_code', validateFillCode],
  ['find_bug', validateFindBug],
  ['predict_output', validatePredictOutput],
]);
