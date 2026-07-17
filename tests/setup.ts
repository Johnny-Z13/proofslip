import 'dotenv/config'

// Integration tests create and delete rows via the app under test, which
// reads DATABASE_URL. Require an explicit TEST_DATABASE_URL and remap it so
// a test run can never mutate whatever DATABASE_URL happens to point at
// (e.g. production). Suites that never touch the DB run fine without it.
if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL
} else {
  delete process.env.DATABASE_URL
}
