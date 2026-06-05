/**
 * InviteCard migration is additive-only:
 * - Creates new InviteCard table
 * - Optional FK to User (createdById) with ON DELETE SET NULL
 * - Does NOT alter PartnerProfile, User passwords, roles, or Growth data
 */

export const INVITE_MIGRATION_SAFE = true as const;
