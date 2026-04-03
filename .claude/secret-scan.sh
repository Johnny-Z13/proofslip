#!/usr/bin/env bash
# Pre-commit secret scanner for Claude Code hooks
# Scans staged files for common secret patterns before git commit/push

INPUT=$(cat)
CMD=$(echo "$INPUT" | node -e "process.stdin.on('data',d=>{try{console.log(JSON.parse(d).tool_input.command)}catch(e){console.log('')}})")

# Only run on git commit or git push
if ! echo "$CMD" | grep -qE '^git (commit|push)'; then
  exit 0
fi

# Get staged files (for commit) or all tracked files (for push)
if echo "$CMD" | grep -qE '^git commit'; then
  FILES=$(git diff --cached --name-only 2>/dev/null)
else
  FILES=$(git diff --name-only HEAD~1 2>/dev/null)
fi

if [ -z "$FILES" ]; then
  exit 0
fi

# Secret patterns to scan for
PATTERNS=(
  'ak_[a-f0-9]{60,}'                    # ProofSlip API keys
  'sk-[a-zA-Z0-9]{20,}'                 # OpenAI/Anthropic keys
  'sk-ant-[a-zA-Z0-9-]{20,}'            # Anthropic keys
  're_[a-zA-Z0-9]{20,}'                 # Resend API keys
  'npg_[a-zA-Z0-9]{10,}'               # Neon passwords
  'ghp_[a-zA-Z0-9]{36}'                 # GitHub PATs
  'gho_[a-zA-Z0-9]{36}'                 # GitHub OAuth tokens
  'npm_[a-zA-Z0-9]{36}'                 # NPM tokens
  'AKIA[0-9A-Z]{16}'                    # AWS access keys
  'Bearer [a-zA-Z0-9_\-\.]{20,}'        # Bearer tokens (in code, not headers)
  'postgresql://[^:]+:[^@]+@'           # DB connection strings with passwords
)

FOUND=""
for pat in "${PATTERNS[@]}"; do
  while IFS= read -r file; do
    [ -z "$file" ] && continue
    [ ! -f "$file" ] && continue
    # Skip binary files and .env (which should be gitignored anyway)
    case "$file" in
      *.png|*.jpg|*.woff2|*.ico|*.lock) continue ;;
    esac
    MATCH=$(grep -nEo "$pat" "$file" 2>/dev/null | head -3)
    if [ -n "$MATCH" ]; then
      FOUND="$FOUND\n  $file: $MATCH"
    fi
  done <<< "$FILES"
done

if [ -n "$FOUND" ]; then
  echo "{\"decision\":\"block\",\"reason\":\"SECRET DETECTED in staged files! Remove these before committing:$FOUND\"}"
  exit 0
fi

exit 0
