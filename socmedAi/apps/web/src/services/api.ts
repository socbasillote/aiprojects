export type ApiHealth = { ok: boolean; service: string; timestamp: string; database: 'connected' | 'disconnected' | 'unconfigured' };

export async function getApiHealth(): Promise<ApiHealth> {
  const response = await fetch('/api/health');
  if (!response.ok) throw new Error('Storm API is unavailable');
  return response.json() as Promise<ApiHealth>;
}
