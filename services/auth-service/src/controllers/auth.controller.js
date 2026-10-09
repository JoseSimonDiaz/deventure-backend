import * as authService from '../services/auth.service.js';

/** Los controllers solo traducen HTTP ↔ service. La lógica vive en auth.service.js. */
export const authController = {
  async register(req, res) {
    const result = await authService.register(req.body);
    res.status(201).json({ data: result });
  },

  async login(req, res) {
    const result = await authService.login(req.body);
    res.json({ data: result });
  },

  async me(req, res) {
    const user = await authService.getMe(req.user.id);
    res.json({ data: user });
  },
};
