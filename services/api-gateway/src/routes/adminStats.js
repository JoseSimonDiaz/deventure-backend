import { dateRangeQuerySchema } from '@deventure/contracts';
import { requireRole, validate } from '@deventure/service-kit';
import { createAdminStatsService } from '../services/adminStats.service.js';

const QUERY_SEPARATOR = '?';

export function registerAdminStats(app, config) {
  const getAdminStats = createAdminStatsService(config);

  app.get(
    '/api/admin/stats',
    requireRole('admin'),
    validate({ query: dateRangeQuerySchema }),
    async (req, res) => {
      const [, rawQuery = ''] = req.originalUrl.split(QUERY_SEPARATOR);
      const queryString = rawQuery ? `${QUERY_SEPARATOR}${rawQuery}` : '';
      const adminStats = await getAdminStats({ queryString, correlationId: req.correlationId });
      res.json({ data: adminStats });
    },
  );
}
