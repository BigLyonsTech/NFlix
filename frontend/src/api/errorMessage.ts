import { AxiosError } from 'axios';

/**
 * Extracts a user-facing message from a failed API call. Distinguishes a
 * reachable server returning a real error (use its message) from the
 * request never reaching the server at all - down backend, CORS block,
 * timeout - which otherwise just looks like a generic, unhelpful failure.
 */
export function getErrorMessage(err: unknown, fallback: string): string {
  const axiosErr = err as AxiosError<{ message?: string }>;
  if (axiosErr?.isAxiosError) {
    if (!axiosErr.response) {
      return "Can't reach the server right now. Check your connection and try again.";
    }
    if (axiosErr.response.data?.message) {
      return axiosErr.response.data.message;
    }
  }
  return fallback;
}
