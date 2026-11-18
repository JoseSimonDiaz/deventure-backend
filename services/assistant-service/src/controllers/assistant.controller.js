import * as assistantService from '../services/assistant.service.js';

export const assistantController = {
  async askAssistant(req, res) {
    const { sessionId, challengeId, question } = req.body;
    const assistantAnswer = await assistantService.askAssistant({
      userId: req.user.id,
      sessionId,
      challengeId,
      question,
      correlationId: req.correlationId,
    });
    res.json({ data: assistantAnswer });
  },

  async askOracle(req, res) {
    const { question } = req.body;
    const oracleAnswer = await assistantService.askOracle({
      userId: req.user.id,
      question,
      correlationId: req.correlationId,
    });
    res.json({ data: oracleAnswer });
  },

  async deleteUserData(req, res) {
    const { userId } = req.params;
    await assistantService.deleteUserData(userId);
    res.status(204).end();
  },
};
