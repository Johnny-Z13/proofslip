import { execSync } from 'child_process'

const DIVIDER = '═'.repeat(50)
const results: { name: string; passed: boolean; detail: string }[] = []

function run(name: string, command: string): boolean {
  console.log(`\n▶ ${name}\n`)
  try {
    execSync(command, { stdio: 'inherit', timeout: 300000 })
    results.push({ name, passed: true, detail: 'passed' })
    return true
  } catch {
    results.push({ name, passed: false, detail: 'FAILED' })
    return false
  }
}

console.log(`\n${DIVIDER}`)
console.log('  ProofSlip Full Stack Test Report')
console.log(DIVIDER)

// Layer 1: Existing unit + integration tests
run('[1/4] Unit & Integration Tests', 'npx vitest run tests/lib/ tests/routes/')

// Layer 2: Smoke tests against production
run('[2/4] Smoke Tests (proofslip.ai)', 'npx vitest run tests/smoke/')

// Layer 3: MCP Server package tests
run('[3/4] MCP Server Package', 'npx vitest run tests/packages/')

// Layer 4: LangChain package tests
run('[4/4] LangChain Package', 'cd packages/langchain && python -m pytest tests/ -v')

// Summary
console.log(`\n${DIVIDER}`)
console.log('  Summary')
console.log(DIVIDER)
for (const r of results) {
  const icon = r.passed ? '✓' : '✗'
  console.log(`  ${icon} ${r.name}`)
}
console.log(DIVIDER)

const allPassed = results.every((r) => r.passed)
if (allPassed) {
  console.log('  ALL PASSED ✓')
} else {
  console.log('  SOME TESTS FAILED ✗')
}
console.log(`${DIVIDER}\n`)

process.exit(allPassed ? 0 : 1)
