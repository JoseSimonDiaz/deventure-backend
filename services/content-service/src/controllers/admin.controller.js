import * as adminService from '../services/admin.service.js';

export const adminController = {
  async listZones(_req, res) {
    const zones = await adminService.listZones();
    res.json({ data: zones });
  },

  async createZone(req, res) {
    const zone = await adminService.createZone(req.user.id, req.body);
    res.status(201).json({ data: zone });
  },

  async updateZone(req, res) {
    const { zoneId } = req.params;
    const zone = await adminService.updateZone(req.user.id, zoneId, req.body);
    res.json({ data: zone });
  },

  async createLevel(req, res) {
    const { zoneId } = req.params;
    const level = await adminService.createLevel(req.user.id, zoneId, req.body);
    res.status(201).json({ data: level });
  },

  async updateLevel(req, res) {
    const { levelId } = req.params;
    const level = await adminService.updateLevel(req.user.id, levelId, req.body);
    res.json({ data: level });
  },

  async reorderLevels(req, res) {
    const { zoneId } = req.params;
    const { levelIds } = req.body;
    const zone = await adminService.reorderLevels(req.user.id, zoneId, levelIds);
    res.json({ data: zone });
  },

  async listLevelChallenges(req, res) {
    const { levelId } = req.params;
    const level = await adminService.listLevelChallenges(levelId);
    res.json({ data: level });
  },

  async createChallenge(req, res) {
    const { levelId } = req.params;
    const challenge = await adminService.createChallenge(req.user.id, levelId, req.body);
    res.status(201).json({ data: challenge });
  },

  async replaceChallenge(req, res) {
    const { challengeId } = req.params;
    const challenge = await adminService.replaceChallenge(req.user.id, challengeId, req.body);
    res.json({ data: challenge });
  },

  async deleteChallenge(req, res) {
    const { challengeId } = req.params;
    await adminService.deleteChallenge(req.user.id, challengeId);
    res.status(204).end();
  },

  async previewChallenge(req, res) {
    const validation = await adminService.previewChallenge(req.body, req.correlationId);
    res.json({ data: validation });
  },
};
