const countOccurrences = (text, character) => text.split(character).length - 1;

function describePairProblem(code, { opening, closing, name }) {
  const unclosedCount = countOccurrences(code, opening) - countOccurrences(code, closing);
  if (unclosedCount > 0) return `Te falta cerrar ${name}`;
  if (unclosedCount < 0) return `Te sobra ${name} de cierre`;
  return '';
}

function describeQuoteProblem(code, { quote, name }) {
  const hasUnclosedQuote = countOccurrences(code, quote) % 2 === 1;
  return hasUnclosedQuote ? `Te falta cerrar ${name}` : '';
}

export function findBalanceProblem(code) {
  return (
    describePairProblem(code, { opening: '(', closing: ')', name: 'un paréntesis' }) ||
    describePairProblem(code, { opening: '{', closing: '}', name: 'una llave' }) ||
    describePairProblem(code, { opening: '[', closing: ']', name: 'un corchete' }) ||
    describeQuoteProblem(code, { quote: '"', name: 'unas comillas dobles' }) ||
    describeQuoteProblem(code, { quote: "'", name: 'unas comillas simples' })
  );
}
