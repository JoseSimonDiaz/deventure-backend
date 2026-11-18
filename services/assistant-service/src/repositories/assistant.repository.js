import { prisma } from '../db.js';

export const assistantRepository = {
  countLevelQueries(userId, levelId) {
    return prisma.assistantQuery.count({ where: { userId, levelId } });
  },

  async saveQuery({ userId, sessionId, levelId, challengeId, question, answer, source, limit }) {
    const [savedQuery] = await prisma.$queryRaw`
      INSERT INTO assistant_queries (
        user_id, session_id, level_id, challenge_id, query_number, question, answer, source
      )
      SELECT ${userId}::uuid, ${sessionId}::uuid, ${levelId}::uuid, ${challengeId}::uuid,
             count(*) + 1, ${question}, ${answer}, ${source}::answer_source
        FROM assistant_queries
       WHERE user_id = ${userId}::uuid AND level_id = ${levelId}::uuid
      HAVING count(*) < ${limit}
      RETURNING query_number AS "queryNumber"
    `;
    return savedQuery;
  },

  async countTodayOracleQueries({ userId, timeZone }) {
    const [{ usedQueries }] = await prisma.$queryRaw`
      SELECT count(*)::int AS "usedQueries"
        FROM oracle_queries
       WHERE user_id = ${userId}::uuid
         AND query_day = (now() AT TIME ZONE ${timeZone})::date
    `;
    return usedQueries;
  },

  async saveOracleQuery({ userId, question, answer, timeZone, limit }) {
    const [savedQuery] = await prisma.$queryRaw`
      INSERT INTO oracle_queries (user_id, query_day, query_number, question, answer)
      SELECT ${userId}::uuid, (now() AT TIME ZONE ${timeZone})::date, count(*) + 1,
             ${question}, ${answer}
        FROM oracle_queries
       WHERE user_id = ${userId}::uuid
         AND query_day = (now() AT TIME ZONE ${timeZone})::date
      HAVING count(*) < ${limit}
      RETURNING query_number AS "queryNumber"
    `;
    return savedQuery;
  },

  deleteUserData(userId) {
    return prisma.$transaction([
      prisma.assistantQuery.deleteMany({ where: { userId } }),
      prisma.oracleQuery.deleteMany({ where: { userId } }),
    ]);
  },
};
