import { requireRole } from '@deventure/service-kit';
import { createProxyMiddleware } from 'http-proxy-middleware';

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

export function registerProxies(app, config) {
  const timeoutMs = config.PROXY_TIMEOUT_MS;

  registerServiceRoutes(app, { name: 'auth', target: config.AUTH_URL, timeoutMs });
  registerServiceRoutes(app, { name: 'content', target: config.CONTENT_URL, timeoutMs });
  registerServiceRoutes(app, { name: 'gameplay', target: config.GAMEPLAY_URL, timeoutMs });
  registerServiceRoutes(app, { name: 'progress', target: config.PROGRESS_URL, timeoutMs });
  registerServiceRoutes(app, { name: 'rewards', target: config.REWARDS_URL, timeoutMs });
}

function registerServiceRoutes(app, { name, target, timeoutMs }) {
  app.use(
    `/api/admin/${name}`,
    requireRole('admin'),
    serviceProxy({ name, target, prefix: '/admin', timeoutMs }),
  );
  app.use(`/api/${name}`, serviceProxy({ name, target, prefix: `/${name}`, timeoutMs }));
}
