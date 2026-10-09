import { requireRole } from '@deventure/service-kit';
import { createProxyMiddleware } from 'http-proxy-middleware';

/**
 * Crea un proxy hacia un microservicio.
 * Express ya le sacó el prefijo público (ej. `/api/auth`) a la ruta; acá se le agrega el prefijo
 * interno del servicio (ej. `/auth`). Además pone los headers de identidad y correlación.
 *
 * @param {{ name: string, target: string, prefix: string, timeoutMs: number }} options
 */
function serviceProxy({ name, target, prefix, timeoutMs }) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    proxyTimeout: timeoutMs,
    pathRewrite: (path) => `${prefix}${path === '/' ? '' : path}`,
    on: {
      proxyReq(proxyReq, req) {
        proxyReq.removeHeader('authorization');
        proxyReq.setHeader('x-correlation-id', req.correlationId);
        if (req.user) {
          proxyReq.setHeader('x-user-id', req.user.id);
          proxyReq.setHeader('x-user-role', req.user.role);
          proxyReq.setHeader('x-user-name', req.user.username);
        }
      },
      error(err, req, res) {
        req.log?.error({ err, service: name }, 'Error al reenviar al servicio');
        if (!res.headersSent && typeof res.writeHead === 'function') {
          res.writeHead(503, { 'content-type': 'application/json' });
        }
        res.end(
          JSON.stringify({
            error: {
              code: 'SERVICE_UNAVAILABLE',
              message: `El servicio ${name} no está disponible`,
            },
          }),
        );
      },
    },
  });
}

/**
 * Tabla de ruteo (DEV-38):
 * | /api/auth/*            → auth-service     /auth/*
 * | /api/content/*         → content-service  /content/*
 * | /api/gameplay/*        → gameplay-service /gameplay/*
 * | /api/progress/*        → progress-service /progress/*
 * | /api/rewards/*         → rewards-service  /rewards/*
 * | /api/admin/<servicio>/* → <servicio>       /admin/*   (solo rol admin)
 *
 * @param {import('express').Express} app
 * @param {import('../config.js').GatewayConfig} config
 */
export function registerProxies(app, config) {
  const services = {
    auth: config.AUTH_URL,
    content: config.CONTENT_URL,
    gameplay: config.GAMEPLAY_URL,
    progress: config.PROGRESS_URL,
    rewards: config.REWARDS_URL,
  };
  const timeoutMs = config.PROXY_TIMEOUT_MS;

  for (const [name, target] of Object.entries(services)) {
    app.use(
      `/api/admin/${name}`,
      requireRole('admin'),
      serviceProxy({ name, target, prefix: '/admin', timeoutMs }),
    );
  }

  for (const [name, target] of Object.entries(services)) {
    app.use(`/api/${name}`, serviceProxy({ name, target, prefix: `/${name}`, timeoutMs }));
  }
}
