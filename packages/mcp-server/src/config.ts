export interface ProofSlipConfig {
  apiKey?: string;
  baseUrl: string;
}

export function resolveConfig(options?: {
  apiKey?: string;
  baseUrl?: string;
}): ProofSlipConfig {
  return {
    apiKey: options?.apiKey ?? process.env.PROOFSLIP_API_KEY,
    baseUrl:
      options?.baseUrl ??
      process.env.PROOFSLIP_BASE_URL ??
      'https://proofslip.ai',
  };
}
