/**
 * Extracts a human-readable message from any thrown value.
 *
 * Single source of truth for turning an unknown error into a display/log
 * string, so the UI never shows "[object Object]" (the result of String()
 * on a plain object). Handles, in order:
 *   1. Error instances (incl. RateLimitError / ManufacturerServerError /
 *      bagService Errors / React ErrorBoundary errors) -> err.message
 *   2. plain objects carrying a string `message` (e.g. the ApiError object
 *      thrown by hupieApi) -> that message  <- the original bug
 *   3. raw strings -> the string itself
 *   4. anything else -> a Dutch fallback (never String(err)).
 */
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  }

  if (typeof err === 'object' && err !== null && 'message' in err) {
    const message = (err as { message: unknown }).message;
    if (typeof message === 'string') {
      return message;
    }
  }

  if (typeof err === 'string') {
    return err;
  }

  return 'Onbekende fout';
}
