/**
 * Ids FIJOS de los usuarios del seed. Los seeds de progress y rewards insertan filas con estos
 * userId, así las referencias entre servicios (sin foreign keys) sobreviven a un `db:reset`.
 */
export const SEED_USER_IDS = Object.freeze({
  admin: '00000000-0000-4000-8000-000000000001',
  demo: '00000000-0000-4000-8000-000000000002',
});
