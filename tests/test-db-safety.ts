function databaseTarget(connectionString: string): string {
  let parsed: URL
  try {
    parsed = new URL(connectionString)
  } catch {
    throw new Error('TEST_DATABASE_URL must be a valid PostgreSQL connection URL.')
  }

  // Neon exposes pooled and direct hostnames for the same endpoint. Treat
  // those as the same database target so switching pool modes cannot bypass
  // the production-safety check.
  const hostname = parsed.hostname.toLowerCase().replace(/-pooler(?=\.)/, '')
  return `${hostname}${parsed.pathname}`
}

export function assertIsolatedTestDatabase(
  testDatabaseUrl: string,
  applicationDatabaseUrl: string | undefined,
): void {
  if (!testDatabaseUrl.trim()) {
    throw new Error('TEST_DATABASE_URL is empty. Point it at a dedicated test database.')
  }
  if (!applicationDatabaseUrl?.trim()) return

  if (
    testDatabaseUrl.trim() === applicationDatabaseUrl.trim() ||
    databaseTarget(testDatabaseUrl) === databaseTarget(applicationDatabaseUrl)
  ) {
    throw new Error(
      'TEST_DATABASE_URL resolves to the same database as DATABASE_URL. Create a dedicated test database or Neon branch before running integration tests.',
    )
  }
}
