export function formatMs(ms: number): string {
  if (ms < 60000) {
    // Less than 60 seconds: show seconds with decimals, no rounding
    return `${(ms / 1000).toFixed(3)}s`;
  } else {
    // 60 seconds or more: show minutes only, no seconds
    return `${Math.floor(ms / 60000)}m`;
  }
}
