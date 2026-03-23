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
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
}, (table) => [
  uniqueIndex('idx_receipts_idempotency').on(table.apiKeyId, table.idempotencyKey),
  index('idx_receipts_expires_at').on(table.expiresAt),
  index('idx_receipts_api_key_id').on(table.apiKeyId),
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
