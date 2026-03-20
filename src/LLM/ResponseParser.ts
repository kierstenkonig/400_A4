
/**
 * Parses raw Gemini text into structured recommendation objects.
 * Business rules:
 *  - Strips accidental markdown fences before parsing
 *  - Returns empty array if LLM returns [] (no suitable matches)
 *  - Returns null on unrecoverable parse error so caller can show error message
 */

export function parseResponse(rawText: string) {
  try {
    const clean = rawText
      .replace(/```json|```/gi, '')  // strip markdown fences if Gemini adds them anyway
      .trim();

    const parsed = JSON.parse(clean);

    if (!Array.isArray(parsed)) throw new Error('Response was not a JSON array');

    // Validate and normalize each item
    return parsed.map(item => ({
      title:       typeof item.title       === 'string' ? item.title       : 'Unknown Title',
      type:        item.type === 'book'    ? 'book'     : 'movie',
      genre:       typeof item.genre       === 'string' ? item.genre       : '',
      year:        typeof item.year        === 'string' ? item.year        : '',
      author:      typeof item.author      === 'string' ? item.author      : '',
      description: typeof item.description === 'string' ? item.description : '',
      reason:      typeof item.reason      === 'string' ? item.reason      : '',
    }));

  } catch (err: unknown) {
    console.error('ResponseParser failed:', (err as Error).message, '\nRaw text:', rawText);
    return null; // null = unrecoverable, caller should show error banner
  }
}

interface ErrorMessages {
  no_results: string;
  parse_failed: string;
  api_error: string;
}

type ErrorContext = keyof ErrorMessages;

export function buildErrorMessage(context: ErrorContext): string {
  const messages: ErrorMessages = {
    no_results:   'No recommendations found for those preferences. Try a different mood or genre.',
    parse_failed: 'We had trouble reading the AI response. Please try again.',
    api_error:    'Could not reach the recommendation service. Please try again shortly.',
  };
  return messages[context] ?? 'Something went wrong. Please try again.';
}