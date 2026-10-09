/**
 * Convierte un usuario de la base al formato público (userPublicSchema de @deventure/contracts).
 * Nunca incluye passwordHash ni datos internos (bloqueo, contadores, etc.).
 * @returns {import('@deventure/contracts').UserPublic}
 */
export function toPublicUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    introSeen: user.introSeen,
  };
}
