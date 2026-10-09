import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { gatewayConfigSchema } from '../src/config.js';

const SECRET = 'test-secret-de-al-menos-32-caracteres-xx';
const USER_ID = '00000000-0000-4000-8000-000000000002';

const tokenFor = (role = 'player', options = {}) =>
  jwt.sign({ sub: USER_ID, role, username: 'demo' }, SECRET, { algorithm: 'HS256', ...options });

/** Servicio falso que devuelve lo que recibió (método, ruta, headers y body). */
function startUpstream() {
  const upstream = express();
  upstream.use(express.json());
  upstream.all('/{*any}', (req, res) => {
    res.status(req.path.endsWith('/created') ? 201 : 200).json({
      data: { method: req.method, path: req.originalUrl, headers: req.headers, body: req.body },
    });
  });
  return new Promise((resolve) => {
    const server = upstream.listen(0, () => resolve(server));
  });
}

let upstreamServer;
let app;
let upstreamUrl;

const makeApp = (overrides = {}) =>
  buildApp(
    gatewayConfigSchema.parse({
      NODE_ENV: 'test',
      JWT_SECRET: SECRET,
      AUTH_URL: upstreamUrl,
      CONTENT_URL: upstreamUrl,
      GAMEPLAY_URL: upstreamUrl,
      PROGRESS_URL: upstreamUrl,
      // Puerto cerrado para simular un servicio caído
      REWARDS_URL: 'http://127.0.0.1:1',
      RATE_LIMIT_AUTH_MAX: '1000',
      RATE_LIMIT_GLOBAL_MAX: '1000',
      ...overrides,
    }),
  );

beforeAll(async () => {
  upstreamServer = await startUpstream();
  upstreamUrl = `http://127.0.0.1:${upstreamServer.address().port}`;
  app = makeApp();
});

afterAll(async () => {
  await new Promise((resolve) => upstreamServer.close(resolve));
});

describe('rutas públicas', () => {
  it('GET /health responde el propio gateway', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.data.service).toBe('api-gateway');
  });

  it('POST /api/auth/login sin token → se reenvía a auth-service /auth/login con el body', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'demo', password: 'Demo1234' });
    expect(res.status).toBe(200);
    expect(res.body.data.path).toBe('/auth/login');
    expect(res.body.data.body).toEqual({ identifier: 'demo', password: 'Demo1234' });
    expect(res.body.data.headers['x-user-id']).toBeUndefined();
  });

  it('POST /api/auth/register sin token → respeta el status del servicio', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.status).toBe(200);
    expect(res.body.data.path).toBe('/auth/register');
  });
});

describe('autenticación', () => {
  it('sin token → 401 UNAUTHORIZED', async () => {
    const res = await request(app).get('/api/progress/me');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: { code: 'UNAUTHORIZED', message: 'No autorizado' } });
  });

  it('token con otra firma, mal formado o con otro esquema → 401', async () => {
    const forged = jwt.sign(
      { sub: USER_ID, role: 'admin', username: 'x' },
      'otro-secreto-de-32-caracteres-o-mas!!',
    );
    for (const header of [`Bearer ${forged}`, 'Bearer basura', `Basic ${tokenFor()}`]) {
      const res = await request(app).get('/api/progress/me').set('authorization', header);
      expect(res.status).toBe(401);
    }
  });

  it('token con payload incompleto → 401', async () => {
    const bad = jwt.sign({ sub: 'no-uuid', role: 'player' }, SECRET);
    const res = await request(app).get('/api/progress/me').set('authorization', `Bearer ${bad}`);
    expect(res.status).toBe(401);
  });

  it('token vencido → 401 "La sesión expiró"', async () => {
    const expired = tokenFor('player', { expiresIn: -10 });
    const res = await request(app)
      .get('/api/progress/me')
      .set('authorization', `Bearer ${expired}`);
    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe('La sesión expiró');
  });

  it('token válido → reenvía con x-user-id / x-user-role / x-correlation-id y sin Authorization', async () => {
    const res = await request(app)
      .get('/api/progress/me?zona=1')
      .set('authorization', `Bearer ${tokenFor()}`)
      .set('x-correlation-id', 'traza-123');
    expect(res.status).toBe(200);
    const { path, headers } = res.body.data;
    expect(path).toBe('/progress/me?zona=1');
    expect(headers['x-user-id']).toBe(USER_ID);
    expect(headers['x-user-role']).toBe('player');
    expect(headers['x-user-name']).toBe('demo');
    expect(headers['x-correlation-id']).toBe('traza-123');
    expect(headers.authorization).toBeUndefined();
    expect(res.headers['x-correlation-id']).toBe('traza-123');
  });

  it('borra x-user-id / x-user-role / x-internal-token que mande el cliente', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('x-user-id', '11111111-1111-4111-8111-111111111111')
      .set('x-user-role', 'admin')
      .set('x-internal-token', 'robado')
      .send({});
    const { headers } = res.body.data;
    expect(headers['x-user-id']).toBeUndefined();
    expect(headers['x-user-role']).toBeUndefined();
    expect(headers['x-internal-token']).toBeUndefined();
  });

  it('el usuario autenticado no puede pisar su identidad con headers', async () => {
    const res = await request(app)
      .get('/api/content/zones')
      .set('authorization', `Bearer ${tokenFor()}`)
      .set('x-user-role', 'admin');
    expect(res.body.data.headers['x-user-role']).toBe('player');
  });
});

describe('ruteo', () => {
  it.each([
    ['/api/auth/me', '/auth/me'],
    ['/api/content/zones', '/content/zones'],
    ['/api/gameplay/sessions', '/gameplay/sessions'],
    ['/api/progress/me', '/progress/me'],
  ])('%s → %s', async (publicPath, internalPath) => {
    const res = await request(app).get(publicPath).set('authorization', `Bearer ${tokenFor()}`);
    expect(res.body.data.path).toBe(internalPath);
  });

  it('/internal desde afuera → 404 (aunque no tenga token)', async () => {
    for (const path of [
      '/api/progress/internal/level-completions',
      '/internal/users/1',
      '/api/auth/INTERNAL/x',
      '/api/progress/%2Finternal/x',
    ]) {
      const res = await request(app).post(path);
      expect(res.status, path).toBe(404);
    }
  });

  it('/api/admin/<servicio>/* exige rol admin', async () => {
    const player = await request(app)
      .get('/api/admin/content/zones')
      .set('authorization', `Bearer ${tokenFor('player')}`);
    expect(player.status).toBe(403);

    const admin = await request(app)
      .get('/api/admin/content/zones')
      .set('authorization', `Bearer ${tokenFor('admin')}`);
    expect(admin.status).toBe(200);
    expect(admin.body.data.path).toBe('/admin/zones');
    expect(admin.body.data.headers['x-user-role']).toBe('admin');
  });

  it('ruta desconocida con token → 404', async () => {
    const res = await request(app)
      .get('/api/no-existe')
      .set('authorization', `Bearer ${tokenFor()}`);
    expect(res.status).toBe(404);
  });

  it('servicio caído → 503 SERVICE_UNAVAILABLE', async () => {
    const res = await request(app)
      .get('/api/rewards/me')
      .set('authorization', `Bearer ${tokenFor()}`);
    expect(res.status).toBe(503);
    expect(res.body.error).toEqual({
      code: 'SERVICE_UNAVAILABLE',
      message: 'El servicio rewards no está disponible',
    });
  });
});

describe('CORS y rate limit', () => {
  it('permite el origen del frontend y expone x-correlation-id', async () => {
    const res = await request(app)
      .options('/api/auth/login')
      .set('origin', 'http://localhost:5173')
      .set('access-control-request-method', 'POST');
    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });

  it('no permite otros orígenes', async () => {
    const res = await request(app).get('/health').set('origin', 'http://malicioso.com');
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('login: más de RATE_LIMIT_AUTH_MAX pedidos por minuto → 429', async () => {
    const limited = makeApp({ RATE_LIMIT_AUTH_MAX: '2' });
    await request(limited).post('/api/auth/login').send({});
    await request(limited).post('/api/auth/login').send({});
    const res = await request(limited).post('/api/auth/login').send({});
    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe('TOO_MANY_REQUESTS');
  });
});
