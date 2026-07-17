import { describe, it, expect, afterEach } from 'vitest'
import { getTestDb } from '../helpers.js'

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
})
