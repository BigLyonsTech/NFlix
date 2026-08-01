import { API_BASE_URL } from './client';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Streams the assistant's reply token-by-token via onToken. Uses fetch +
 * ReadableStream (not axios) because the backend streams Server-Sent Events
 * and we need an Authorization header, which the native EventSource API
 * can't send.
 */
export async function streamChat(
  messages: ChatMessage[],
  onToken: (token: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const token = localStorage.getItem('netflix_clone_token');

  const res = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ messages }),
    signal,
  });

  if (!res.ok || !res.body) {
    throw new Error(`Chat request failed with status ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split('\n\n');
    buffer = events.pop() ?? '';

    for (const event of events) {
      const line = event.trim();
      if (!line.startsWith('data:')) continue;
      const data = line.slice(5).trim();
      if (data) onToken(data);
    }
  }
}
