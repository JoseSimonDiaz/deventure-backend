import { config } from '../config.js';
import { aiClient } from '../clients/ai.client.js';

const AI_MAX_TOKENS = 300;
const COMPLETE_FINISH_REASON = 'stop';

const SYSTEM_PROMPT = `Sos Björn, un vikingo que acompaña a chicos de secundaria que están aprendiendo a programar en el juego Deventure.
El jugador está resolviendo un desafío y te hace una pregunta.
Tu tarea es orientarlo para que llegue solo a la respuesta:
- Nunca des la respuesta completa, el código final, la opción correcta ni la salida exacta.
- Si te piden la solución, explicá con amabilidad que no podés dársela y ofrecé una pista.
- No escribas código, operadores ni expresiones que formen parte de la respuesta: hacé una pregunta o describí la idea para que el jugador la escriba.
- Respondé en español rioplatense, en segunda persona ("vos"), con un tono cálido y simple.
- Usá como máximo 3 oraciones y explicá cualquier término técnico que menciones.
- Respondé solo sobre el desafío; si la pregunta no tiene que ver, volvé al desafío con amabilidad.`;

const ORACLE_SYSTEM_PROMPT = `Sos Björn, el sabio vikingo al que los guerreros de Deventure consultan como a un oráculo. Acompañás a chicos de secundaria que están aprendiendo a programar.
El jugador está en el mapa del juego, fuera de un nivel, y te hace una pregunta.
- Respondé dudas de programación y de cómo aprender: conceptos, buenas prácticas, para qué sirve algo.
- Podés mostrar un ejemplo corto de código, pero nunca resuelvas los desafíos del juego por el jugador.
- Si la pregunta no tiene que ver con programar o con el juego, decí con amabilidad que tu sabiduría es sobre programación.
- Respondé en español rioplatense, en segunda persona ("vos"), con un tono cálido y simple, y algún toque nórdico sin exagerar (runas, fiordos, drakkars, Odín).
- Usá como máximo 4 oraciones y explicá cualquier término técnico que menciones.`;

function buildChallengeContext({ challenge, question }) {
  return `Desafío (${challenge.type}, lenguaje ${challenge.language}):
${challenge.statement}

Datos que ve el jugador:
${JSON.stringify(challenge.payload)}

Pregunta del jugador:
${question}`;
}

export const isAiAvailable = () => Boolean(aiClient);

async function requestAiAnswer({ systemPrompt, userContent }) {
  const response = await aiClient.chat.completions.create({
    model: config.AI_MODEL,
    max_completion_tokens: AI_MAX_TOKENS,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
  });
  const [firstChoice] = response.choices;
  if (firstChoice.finish_reason !== COMPLETE_FINISH_REASON || !firstChoice.message.content) {
    throw new Error(`El asistente no devolvió texto (finish_reason: ${firstChoice.finish_reason})`);
  }
  return firstChoice.message.content.trim();
}

export function generateAiHint({ challenge, question }) {
  return requestAiAnswer({
    systemPrompt: SYSTEM_PROMPT,
    userContent: buildChallengeContext({ challenge, question }),
  });
}

export function generateOracleAnswer(question) {
  return requestAiAnswer({ systemPrompt: ORACLE_SYSTEM_PROMPT, userContent: question });
}
