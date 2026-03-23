import { nanoid } from 'nanoid'

export function generateReceiptId(): string {
  return `rct_${nanoid(21)}`
}

export function generateApiKeyId(): string {
  return `key_${nanoid(21)}`
}

export function generateApiKey(): string {
  const hex = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return `ak_${hex}`
}

export function getKeyPrefix(apiKey: string): string {
  return apiKey.slice(0, 11) // "ak_" + first 8 hex chars
}
