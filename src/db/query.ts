import 'dotenv/config'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

async function main() {
  const keys = await sql`SELECT id, key_prefix, owner_email, tier, usage_count FROM api_keys`
  console.log('=== API KEYS ===')
  for (const k of keys) {
    console.log(`  ${k.key_prefix}...  ${k.owner_email}  tier=${k.tier}  usage=${k.usage_count}`)
  }

  const recs = await sql`SELECT id, type, status, summary, created_at, expires_at FROM receipts ORDER BY created_at DESC`
  console.log(`\n=== RECEIPTS (${recs.length}) ===`)
  for (const r of recs) {
    console.log(`  ${r.id}  ${r.type}/${r.status}  "${r.summary}"`)
    console.log(`    created: ${r.created_at}  expires: ${r.expires_at}`)
  }
}

main().catch(console.error)
