import type { SignatureRecord, SignatureSubmission } from './types.js';

export interface SignClientOptions {
  /** Public key (client-safe) or secret key (server-only), depending on usage. */
  apiKey: string;
  baseUrl?: string;
}

export class SignClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(options: SignClientOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl ?? 'https://api.sign-pkg.dev').replace(/\/$/, '');
  }

  /** Submit a signature. Requires a public key. */
  async submitSignature(payload: SignatureSubmission): Promise<SignatureRecord> {
    return this.request<SignatureRecord>('/signatures', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /** Fetch a single signature record. Requires a secret key. */
  async getSignature(id: string): Promise<SignatureRecord> {
    return this.request<SignatureRecord>(`/signatures/${id}`);
  }

  /** List signatures for a project. Requires a secret key. */
  async listSignatures(projectId: string): Promise<SignatureRecord[]> {
    return this.request<SignatureRecord[]>(`/signatures?projectId=${encodeURIComponent(projectId)}`);
  }

  /** Delete a signature record (right-to-erasure). Requires a secret key. */
  async deleteSignature(id: string): Promise<void> {
    await this.request<void>(`/signatures/${id}`, { method: 'DELETE' });
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        ...init.headers,
      },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`SignClient request failed: ${res.status} ${res.statusText} ${body}`);
    }

    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  }
}
