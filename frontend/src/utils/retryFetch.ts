export async function retryFetch<T>(fetchFunction: () => Promise<T>, attempts = 3): Promise<T> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fetchFunction();
    } catch (err) {
      const remaining = attempts - i - 1;
      if (remaining === 0) throw err;
      console.warn(`Fetch attempt failed, retrying... (${remaining} attempt(s) left)`, err);
    }
  }
  // Unreachable, but satisfies TS control-flow analysis
  throw new Error('retryFetch: exhausted attempts unexpectedly');
}