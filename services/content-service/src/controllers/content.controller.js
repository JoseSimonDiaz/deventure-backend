import * as contentService from '../services/content.service.js';

export const contentController = {
  async listZones(_req, res) {
    const zones = await contentService.listPublishedZones();
    res.json({ data: zones });
  },

  async getLevel(req, res) {
    const { levelId } = req.params;
    const level = await contentService.getLevelForPlayer(levelId);
    res.json({ data: level });
  },

  async getZoneTheory(req, res) {
    const { zoneId } = req.params;
    const zoneTheory = await contentService.getZoneTheory(zoneId);
    res.json({ data: zoneTheory });
  },
};
