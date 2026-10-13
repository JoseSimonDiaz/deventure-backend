export function healthHandler({ name, version, healthCheck }) {
  return async (req, res) => {
    try {
      if (healthCheck) await healthCheck();
      res.json({
        data: { status: 'ok', service: name, version, uptime: Number(process.uptime().toFixed(1)) },
      });
    } catch (err) {
      req.log?.warn({ err }, 'Health check falló');
      res.status(503).json({
        error: { code: 'SERVICE_UNAVAILABLE', message: `${name} no está disponible` },
      });
    }
  };
}
