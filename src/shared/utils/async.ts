/** Simulates network latency for mock repositories so loading states are realistic. */
export function simulatedDelay(ms = 150): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
