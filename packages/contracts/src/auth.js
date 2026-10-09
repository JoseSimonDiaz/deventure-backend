import { z } from 'zod';
import { idSchema } from './common.js';

export const ROLES = /** @type {const} */ (['player', 'admin']);
export const roleSchema = z.enum(ROLES);

export const usernameSchema = z
  .string()
  .trim()
  .min(3, 'El usuario debe tener al menos 3 caracteres')
  .max(20, 'El usuario puede tener como máximo 20 caracteres')
  .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guion bajo');

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, 'El email es demasiado largo')
  .email('Email inválido');

// bcrypt solo usa los primeros 72 bytes: más largo no aporta seguridad.
export const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(72, 'La contraseña puede tener como máximo 72 caracteres')
  .regex(/[a-zA-Z]/, 'La contraseña debe tener al menos una letra')
  .regex(/[0-9]/, 'La contraseña debe tener al menos un número');

/** POST /auth/register */
export const registerSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});

/** POST /auth/login · `identifier` es el username o el email. */
export const loginSchema = z.object({
  identifier: z.string().trim().min(3, 'Ingresá tu usuario o email').max(254),
  password: z.string().min(1, 'Ingresá tu contraseña').max(72),
});

/** Usuario tal como lo ve el frontend. NUNCA incluye passwordHash. */
export const userPublicSchema = z.object({
  id: idSchema,
  username: z.string(),
  email: z.string().email(),
  role: roleSchema,
  introSeen: z.boolean(),
});

/** Respuesta de register y login (dentro de `{ data }`). */
export const authResponseSchema = z.object({
  token: z.string().min(1),
  user: userPublicSchema,
});

/** Payload del JWT (HS256, 24 h). */
export const jwtPayloadSchema = z.object({
  sub: idSchema,
  role: roleSchema,
  username: z.string(),
});

/** Preferencias del jugador (DEV-04 / DEV-05). */
export const settingsSchema = z.object({
  musicVolume: z.number().int().min(0).max(100),
  musicMuted: z.boolean(),
  sfxVolume: z.number().int().min(0).max(100),
  sfxMuted: z.boolean(),
  brightness: z.number().int().min(50).max(150),
});

export const DEFAULT_SETTINGS = Object.freeze({
  musicVolume: 50,
  musicMuted: false,
  sfxVolume: 70,
  sfxMuted: false,
  brightness: 100,
});

/** @typedef {z.infer<typeof registerSchema>} RegisterRequest */
/** @typedef {z.infer<typeof loginSchema>} LoginRequest */
/** @typedef {z.infer<typeof userPublicSchema>} UserPublic */
/** @typedef {z.infer<typeof authResponseSchema>} AuthResponse */
/** @typedef {z.infer<typeof jwtPayloadSchema>} JwtPayload */
/** @typedef {z.infer<typeof settingsSchema>} Settings */
