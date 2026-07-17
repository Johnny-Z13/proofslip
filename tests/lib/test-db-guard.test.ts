import { describe, it, expect, afterEach } from 'vitest'
import { getTestDb } from '../helpers.js'
import { assertIsolatedTestDatabase } from '../test-db-safety.js'

const saved = process.env.TEST_DATABASE_URL

afterEach(() => {
  if (saved === undefined) delete process.env.TEST_DATABASE_URL
  else process.env.TEST_DATABASE_URL = saved
})

describe('test database guard', () => {
  it('refuses to hand out a DB connection without an explicit TEST_DATABASE_URL', () => {
    delete process.env.TEST_DATABASE_URL
    expect(() => getTestDb()).toThrow(/TEST_DATABASE_URL/)
  })

  it('rejects the exact application database as the test database', () => {
    const production = 'postgresql://owner:secret@ep-production.example.test/neondb?sslmode=require'
    expect(() => assertIsolatedTestDatabase(production, production)).toThrow(/same database/)
  })

  it('rejects pooled and direct URLs for the same Neon database target', () => {
    const direct = 'postgresql://owner:one@ep-production.example.test/neondb?sslmode=require'
    const pooled = 'postgresql://owner:two@ep-production-pooler.example.test/neondb?sslmode=require'
    expect(() => assertIsolatedTestDatabase(pooled, direct)).toThrow(/same database/)
  })

  it('accepts a different database branch', () => {
    const production = 'postgresql://owner:one@ep-production.example.test/neondb?sslmode=require'
    const test = 'postgresql://owner:two@ep-test.example.test/neondb?sslmode=require'
    expect(() => assertIsolatedTestDatabase(test, production)).not.toThrow()
  })
})
