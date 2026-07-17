import { pgTable, text, integer, jsonb, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core'

export const receipts = pgTable('receipts', {
  id: text('id').primaryKey(),
  apiKeyId: text('api_key_id').notNull(),
  type: text('type').notNull(),
  status: text('status').notNull(),
  summary: text('summary').notNull(),
  payload: jsonb('payload'),
  ref: jsonb('ref'),
  idempotencyKey: text('idempotency_key'),
  audience: text('audience'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
}, (table) => [
  uniqueIndex('idx_receipts_idempotency').on(table.apiKeyId, table.idempotencyKey),
  index('idx_receipts_expires_at').on(table.expiresAt),
  index('idx_receipts_api_key_id').on(table.apiKeyId),
])

// Immutable release-proof records (release-proof/v1). No application code updates these rows.
export const proofs = pgTable('proofs', {
  id: text('id').primaryKey(),
  schemaVersion: text('schema_version').notNull(),
  proofType: text('proof_type').notNull(),
  issuerType: text('issuer_type').notNull(),
  repository: text('repository').notNull(),
  issuerClaims: jsonb('issuer_claims').notNull(),
  observations: jsonb('observations').notNull(),
  submittedContext: jsonb('submitted_context'),
  idempotencyKey: text('idempotency_key'),
  jtiDigest: text('jti_digest').notNull(),
  requestId: text('request_id'),
  issuedAt: timestamp('issued_at', { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
}, (table) => [
  uniqueIndex('idx_proofs_jti_digest').on(table.jtiDigest),
  uniqueIndex('idx_proofs_idempotency').on(table.repository, table.idempotencyKey),
  index('idx_proofs_expires_at').on(table.expiresAt),
  index('idx_proofs_repository').on(table.repository),
])

// Aggregate-only instrumentation. Never stores tokens, emails, IPs, or payload content.
export const proofEvents = pgTable('proof_events', {
  id: text('id').primaryKey(),
  event: text('event').notNull(),
  reason: text('reason'),
  repositoryDigest: text('repository_digest'),
  repositoryVisibility: text('repository_visibility'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_proof_events_event').on(table.event),
  index('idx_proof_events_created_at').on(table.createdAt),
])

export const apiKeys = pgTable('api_keys', {
  id: text('id').primaryKey(),
  keyPrefix: text('key_prefix').notNull(),
  keyHash: text('key_hash').notNull().unique(),
  ownerEmail: text('owner_email').notNull(),
  tier: text('tier').notNull().default('free'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  usageCount: integer('usage_count').default(0),
  usageResetAt: timestamp('usage_reset_at', { withTimezone: true }),
}, (table) => [
  index('idx_api_keys_prefix').on(table.keyPrefix),
])
