import { z } from 'zod';
import { idSchema } from './common.js';

export const ROLES = Object.freeze(['player', 'admin']);
export const roleSchema = z.enum(ROLES);

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;
export const EMAIL_MAX_LENGTH = 254;
export const PASSWORD_MIN_LENGTH = 8;
export const BCRYPT_MAX_PASSWORD_BYTES = 72;
export const LOGIN_IDENTIFIER_MIN_LENGTH = USERNAME_MIN_LENGTH;

export const VOLUME_MIN = 0;
export const VOLUME_MAX = 100;
export const BRIGHTNESS_MIN = 50;
export const BRIGHTNESS_MAX = 150;

export const usernameSchema = z
  .string()
  .trim()
  .min(USERNAME_MIN_LENGTH, `El usuario debe tener al menos ${USERNAME_MIN_LENGTH} caracteres`)
  .max(USERNAME_MAX_LENGTH, `El usuario puede tener como máximo ${USERNAME_MAX_LENGTH} caracteres`)
  .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guion bajo');

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(EMAIL_MAX_LENGTH, 'El email es demasiado largo')
  .email('Email inválido');

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`)
  .max(
    BCRYPT_MAX_PASSWORD_BYTES,
    `La contraseña puede tener como máximo ${BCRYPT_MAX_PASSWORD_BYTES} caracteres`,
  )
  .regex(/[a-zA-Z]/, 'La contraseña debe tener al menos una letra')
  .regex(/[0-9]/, 'La contraseña debe tener al menos un número');

export const registerSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(LOGIN_IDENTIFIER_MIN_LENGTH, 'Ingresá tu usuario o email')
    .max(EMAIL_MAX_LENGTH),
  password: z.string().min(1, 'Ingresá tu contraseña').max(BCRYPT_MAX_PASSWORD_BYTES),
});

export const userPublicSchema = z.object({
  id: idSchema,
  username: z.string(),
  email: z.string().email(),
  role: roleSchema,
  introSeen: z.boolean(),
});

export const authResponseSchema = z.object({
  token: z.string().min(1),
  user: userPublicSchema,
});

export const jwtPayloadSchema = z.object({
  sub: idSchema,
  role: roleSchema,
  username: z.string(),
});

const volumeSchema = z.number().int().min(VOLUME_MIN).max(VOLUME_MAX);

export const settingsSchema = z.object({
  musicVolume: volumeSchema,
  musicMuted: z.boolean(),
  sfxVolume: volumeSchema,
  sfxMuted: z.boolean(),
  brightness: z.number().int().min(BRIGHTNESS_MIN).max(BRIGHTNESS_MAX),
});

export const DEFAULT_SETTINGS = Object.freeze({
  musicVolume: 50,
  musicMuted: false,
  sfxVolume: 70,
  sfxMuted: false,
  brightness: 100,
});
