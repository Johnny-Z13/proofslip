export type {
  ReceiptType,
  CreateReceiptInput,
  Receipt,
  VerifyResult,
  StatusResult,
  SignupResult,
} from './types.js'

export { ProofSlipError } from './errors.js'

export { isTerminal, getNextPollAfterSeconds } from './polling.js'
