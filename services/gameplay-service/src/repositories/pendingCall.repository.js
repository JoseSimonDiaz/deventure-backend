import { PendingCallStatus, Prisma } from '../../generated/prisma-client/index.js';
import { prisma } from '../db.js';

const PENDING_CALL_SELECT = Object.freeze({
  id: true,
  target: true,
  method: true,
  path: true,
  body: true,
  sessionId: true,
  correlationId: true,
  attempts: true,
  nextRetryAt: true,
  lastError: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export const pendingCallRepository = {
  enqueue({ target, method, path, body, sessionId, userId, correlationId, lastError }) {
    return prisma.pendingInternalCall.upsert({
      where: { target_sessionId: { target, sessionId } },
      update: {},
      create: { target, method, path, body, sessionId, userId, correlationId, lastError },
      select: { id: true },
    });
  },

  findNextDue(now) {
    return prisma.pendingInternalCall.findFirst({
      where: { status: PendingCallStatus.pending, nextRetryAt: { lte: now } },
      orderBy: { createdAt: Prisma.SortOrder.asc },
      select: PENDING_CALL_SELECT,
    });
  },

  markDone(pendingCallId) {
    return prisma.pendingInternalCall.update({
      where: { id: pendingCallId },
      data: { status: PendingCallStatus.done },
      select: { id: true },
    });
  },

  markForRetry(pendingCallId, { attempts, lastError, nextRetryAt }) {
    return prisma.pendingInternalCall.update({
      where: { id: pendingCallId },
      data: { attempts, lastError, nextRetryAt },
      select: { id: true },
    });
  },

  markFailed(pendingCallId, { attempts, lastError }) {
    return prisma.pendingInternalCall.update({
      where: { id: pendingCallId },
      data: { attempts, lastError, status: PendingCallStatus.failed },
      select: { id: true },
    });
  },

  deleteDoneBefore(limitDate) {
    return prisma.pendingInternalCall.deleteMany({
      where: { status: PendingCallStatus.done, updatedAt: { lt: limitDate } },
    });
  },

  findPage({ status, page, limit }) {
    return prisma.$transaction([
      prisma.pendingInternalCall.findMany({
        where: { status },
        orderBy: { createdAt: Prisma.SortOrder.desc },
        skip: (page - 1) * limit,
        take: limit,
        select: PENDING_CALL_SELECT,
      }),
      prisma.pendingInternalCall.count({ where: { status } }),
    ]);
  },
};
