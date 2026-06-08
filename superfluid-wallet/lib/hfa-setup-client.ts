export type HfaSetupSessionStatus = 'pending' | 'completed' | 'expired'

export interface HfaSetupSessionPending {
  setupSessionId: string
  status: 'pending' | 'expired'
  agentPublicKey: string
  agentLabel: string | null
  providerPublicKey: string
  expiresAt: number
}

export interface HfaSetupSessionCompleted {
  setupSessionId: string
  status: 'completed'
  agentPublicKey: string
  agentLabel: string | null
  providerPublicKey: string
  expiresAt: number
  subOrganizationId: string
  walletAddress: string
  agentUserId: string
  providerUserId: string
  policyIds: string[]
  completedAt: number
}

export type HfaSetupSession = HfaSetupSessionPending | HfaSetupSessionCompleted

export interface ParsedHfaSetupUrl {
  sessionId: string
  hfaBaseUrl: string
}

export function parseHfaSetupUrlParams(params: {
  session?: string | null
  hfa?: string | null
}): ParsedHfaSetupUrl {
  const sessionId = params.session?.trim() ?? ''
  if (!sessionId) {
    throw new Error('Missing setup session id')
  }

  const encoded = params.hfa?.trim() ?? ''
  if (!encoded) {
    throw new Error('Missing HFA base URL parameter')
  }

  let decoded: string
  try {
    decoded = decodeURIComponent(encoded)
  } catch {
    throw new Error('Invalid HFA base URL encoding')
  }

  let url: URL
  try {
    url = new URL(decoded)
  } catch {
    throw new Error('Invalid HFA base URL')
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('HFA base URL must use http or https')
  }

  if (url.protocol === 'http:' && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
    throw new Error('Only localhost http origins are allowed in local dev')
  }

  return {
    sessionId,
    hfaBaseUrl: decoded.replace(/\/$/, ''),
  }
}

export function buildSetupSessionGetUrl(hfaBaseUrl: string, sessionId: string): string {
  return `${hfaBaseUrl.replace(/\/$/, '')}/api/turnkey/hfa/setup-sessions/${encodeURIComponent(sessionId)}`
}

export function buildSetupSessionCompleteUrl(hfaBaseUrl: string, sessionId: string): string {
  return `${hfaBaseUrl.replace(/\/$/, '')}/api/turnkey/hfa/setup-sessions/${encodeURIComponent(sessionId)}/complete`
}

export async function fetchHfaSetupSession(
  hfaBaseUrl: string,
  sessionId: string,
): Promise<HfaSetupSession> {
  const response = await fetch(buildSetupSessionGetUrl(hfaBaseUrl, sessionId), {
    headers: { accept: 'application/json' },
  })
  const json = await response.json().catch(() => ({}))
  if (response.status === 410) {
    throw new Error('Setup session expired')
  }
  if (!response.ok) {
    throw new Error(typeof json.error === 'string' ? json.error : 'Failed to load setup session')
  }
  return json as HfaSetupSession
}

export interface HfaSetupCompletePayload {
  subOrganizationId: string
  walletAddress: string
  agentPublicKey: string
  agentUserId: string
  providerUserId: string
  policyIds: string[]
  walletOrigin: string
}

export async function completeHfaSetupSession(
  hfaBaseUrl: string,
  sessionId: string,
  payload: HfaSetupCompletePayload,
): Promise<HfaSetupSessionCompleted> {
  const response = await fetch(buildSetupSessionCompleteUrl(hfaBaseUrl, sessionId), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })
  const json = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(typeof json.error === 'string' ? json.error : 'Failed to complete setup session')
  }
  return json as HfaSetupSessionCompleted
}
