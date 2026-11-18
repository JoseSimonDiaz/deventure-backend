import { prisma } from '../db.js';

const toJsonb = (value) => JSON.stringify(value);

export const validationRepository = {
  async hasOption(options, optionId) {
    const [optionLookup] = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1
          FROM jsonb_array_elements(${toJsonb(options)}::jsonb) AS payload_option
         WHERE payload_option ->> 'id' = ${optionId}
      ) AS "isKnownOption"
    `;
    return optionLookup.isKnownOption;
  },

  async compareBlockOrder({ blocks, validOrders, order }) {
    const [blockComparison] = await prisma.$queryRaw`
      SELECT
        (SELECT array_agg(block_id ORDER BY block_id) FROM unnest(${order}::text[]) AS block_id)
          = (SELECT array_agg(block ->> 'id' ORDER BY block ->> 'id')
               FROM jsonb_array_elements(${toJsonb(blocks)}::jsonb) AS block) AS "isComplete",
        EXISTS (
          SELECT 1
            FROM jsonb_array_elements(${toJsonb(validOrders)}::jsonb) AS valid_order
           WHERE valid_order = to_jsonb(${order}::text[])
        ) AS "isCorrect",
        (SELECT (min(answer.position) - 1)::int
           FROM unnest(${order}::text[]) WITH ORDINALITY AS answer(block_id, position)
          WHERE answer.block_id IS DISTINCT FROM
                (${toJsonb(validOrders)}::jsonb -> 0 ->> (answer.position - 1)::int)
        ) AS "firstWrongIndex"
    `;
    return blockComparison;
  },

  async compareBlanks({ validBlanks, blanks, language }) {
    const [blanksComparison] = await prisma.$queryRaw`
      WITH answer AS (
        SELECT
          answer_blank.position,
          normalize_code(answer_blank.value, ${language}) IN (
            SELECT normalize_code(valid_value, ${language})
              FROM jsonb_array_elements_text(
                     ${toJsonb(validBlanks)}::jsonb -> (answer_blank.position - 1)::int
                   ) AS valid_value
          ) AS is_valid
        FROM unnest(${blanks}::text[]) WITH ORDINALITY AS answer_blank(value, position)
      )
      SELECT
        (jsonb_array_length(${toJsonb(validBlanks)}::jsonb) = cardinality(${blanks}::text[])
          AND COALESCE((SELECT bool_and(is_valid) FROM answer), false)) AS "isCorrect",
        (SELECT (min(position) - 1)::int FROM answer WHERE NOT is_valid) AS "firstWrongBlank"
    `;
    return blanksComparison;
  },

  async compareFreeCode({ accepted, requiredTokens, code, language }) {
    const [codeComparison] = await prisma.$queryRaw`
      SELECT (
        normalize_code(${code}, ${language}) IN (
          SELECT normalize_code(accepted_answer, ${language})
            FROM jsonb_array_elements_text(${toJsonb(accepted)}::jsonb) AS accepted_answer
        )
        OR (
          jsonb_array_length(${toJsonb(requiredTokens)}::jsonb) > 0
          AND normalize_code(${code}, ${language}) ~ (
            SELECT string_agg(
                     escape_regex(normalize_code(token.value, ${language})),
                     '.*' ORDER BY token.position)
              FROM jsonb_array_elements_text(${toJsonb(requiredTokens)}::jsonb)
                   WITH ORDINALITY AS token(value, position)
          )
        )
      ) AS "isCorrect"
    `;
    return codeComparison;
  },

  async compareOutput({ expectedOutput, output }) {
    const [outputComparison] = await prisma.$queryRaw`
      WITH expected AS (
        SELECT line, position
          FROM regexp_split_to_table(normalize_output(${expectedOutput}), chr(10))
               WITH ORDINALITY AS expected_line(line, position)
      ),
      actual AS (
        SELECT line, position
          FROM regexp_split_to_table(normalize_output(${output}), chr(10))
               WITH ORDINALITY AS actual_line(line, position)
      )
      SELECT
        normalize_output(${expectedOutput}) = normalize_output(${output}) AS "isCorrect",
        (SELECT min(position)::int
           FROM expected FULL JOIN actual USING (position)
          WHERE expected.line IS DISTINCT FROM actual.line) AS "firstWrongLine"
    `;
    return outputComparison;
  },

  async findFirstCommonError({ commonErrors, answerText }) {
    const [commonError] = await prisma.$queryRaw`
      SELECT
        common_error.item ->> 'message' AS message,
        (SELECT min(code_line.position)::int
           FROM regexp_split_to_table(${answerText}, chr(10))
                WITH ORDINALITY AS code_line(text, position)
          WHERE code_line.text ~ (common_error.item ->> 'pattern')) AS line
      FROM jsonb_array_elements(${toJsonb(commonErrors)}::jsonb)
           WITH ORDINALITY AS common_error(item, position)
      WHERE ${answerText} ~ (common_error.item ->> 'pattern')
      ORDER BY common_error.position
      LIMIT 1
    `;
    return commonError;
  },
};
