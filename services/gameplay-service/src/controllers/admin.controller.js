import * as adminService from '../services/admin.service.js';

export const adminController = {
  async listPendingCalls(req, res) {
    const { status, page, limit } = req.validated.query;
    const pendingCallsPage = await adminService.listPendingCalls({ status, page, limit });
    res.json({ data: pendingCallsPage });
  },
};
