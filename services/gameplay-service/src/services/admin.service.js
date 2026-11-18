import { pendingCallRepository } from '../repositories/pendingCall.repository.js';
import { sessionRepository } from '../repositories/session.repository.js';

const DEFAULT_STATS_RANGE_MS = 30 * 24 * 60 * 60 * 1000;

export async function listPendingCalls({ status, page, limit }) {
  const [pendingCalls, total] = await pendingCallRepository.findPage({ status, page, limit });
  return { items: pendingCalls, total, page, limit };
}

export function getLevelStats({ from, to }) {
  const rangeEnd = to ?? new Date();
  const rangeStart = from ?? new Date(rangeEnd.getTime() - DEFAULT_STATS_RANGE_MS);
  return sessionRepository.findLevelStats({ from: rangeStart, to: rangeEnd });
}
