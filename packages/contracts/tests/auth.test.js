import { describe, expect, it } from 'vitest';
import {
  authResponseSchema,
  errorResponseSchema,
  loginSchema,
  paginationSchema,
  registerSchema,
  settingsSchema,
  userPublicSchema,
} from '../src/index.js';

const validUser = {
  id: '00000000-0000-4000-8000-000000000002',
  username: 'Ragnar',
  email: 'ragnar@kattegat.com',
  role: 'player',
  introSeen: false,
};

describe('registerSchema', () => {
  it('acepta datos válidos y normaliza el email', () => {
    const data = registerSchema.parse({
      username: ' Ragnar_1 ',
      email: '  Ragnar@Kattegat.COM ',
      password: 'Valhalla123',
    });
    expect(data).toEqual({
      username: 'Ragnar_1',
      email: 'ragnar@kattegat.com',
      password: 'Valhalla123',
    });
  });

  it.each([
    ['username corto', { username: 'ab' }],
    ['username con espacios', { username: 'rag nar' }],
    ['username largo', { username: 'a'.repeat(21) }],
    ['email inválido', { email: 'no-es-email' }],
    ['password corta', { password: 'a1' }],
    ['password sin números', { password: 'soloLetras' }],
    ['password sin letras', { password: '12345678' }],
    ['password > 72', { password: `a1${'x'.repeat(71)}` }],
  ])('rechaza %s', (_caso, override) => {
    const input = { username: 'Ragnar', email: 'r@k.com', password: 'Valhalla123', ...override };
    expect(registerSchema.safeParse(input).success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('acepta usuario o email', () => {
    expect(loginSchema.safeParse({ identifier: 'Ragnar', password: 'x' }).success).toBe(true);
    expect(loginSchema.safeParse({ identifier: 'r@k.com', password: 'x' }).success).toBe(true);
  });

  it('rechaza password vacía o identifier faltante', () => {
    expect(loginSchema.safeParse({ identifier: 'Ragnar', password: '' }).success).toBe(false);
    expect(loginSchema.safeParse({ password: 'x' }).success).toBe(false);
  });
});

describe('userPublicSchema / authResponseSchema', () => {
  it('acepta un usuario público válido', () => {
    expect(authResponseSchema.safeParse({ token: 'jwt', user: validUser }).success).toBe(true);
  });

  it('rechaza un rol desconocido o id no uuid', () => {
    expect(userPublicSchema.safeParse({ ...validUser, role: 'root' }).success).toBe(false);
    expect(userPublicSchema.safeParse({ ...validUser, id: '1' }).success).toBe(false);
  });

  it('descarta passwordHash si viniera (strip por defecto)', () => {
    const parsed = userPublicSchema.parse({ ...validUser, passwordHash: 'hash' });
    expect(parsed).not.toHaveProperty('passwordHash');
  });
});

describe('settingsSchema', () => {
  it('valida rangos', () => {
    const ok = {
      musicVolume: 50,
      musicMuted: false,
      sfxVolume: 70,
      sfxMuted: true,
      brightness: 100,
    };
    expect(settingsSchema.safeParse(ok).success).toBe(true);
    expect(settingsSchema.safeParse({ ...ok, brightness: 200 }).success).toBe(false);
    expect(settingsSchema.safeParse({ ...ok, musicVolume: -1 }).success).toBe(false);
  });
});

describe('common', () => {
  it('paginationSchema aplica defaults y máximo', () => {
    expect(paginationSchema.parse({})).toEqual({ page: 1, limit: 20 });
    expect(paginationSchema.safeParse({ limit: '51' }).success).toBe(false);
  });

  it('errorResponseSchema valida la forma de error', () => {
    expect(errorResponseSchema.safeParse({ error: { code: 'X', message: 'y' } }).success).toBe(
      true,
    );
    expect(errorResponseSchema.safeParse({ code: 'X' }).success).toBe(false);
  });
});
