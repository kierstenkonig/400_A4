/**
 * Parses raw Gemini text into structured recommendation objects.
 * Business rules:
 *  - Strips accidental markdown fences before parsing
 *  - Returns empty grouped arrays if LLM returns [] (no suitable matches)
 *  - Returns null on unrecoverable parse error so caller can show error message
 */

export interface ParsedRecommendation {
  title: string;
  type: string;
  genre: string;
  year: string;
  author: string;
  description: string;
  reason: string;
}

export interface ParsedRecommendationGroups {
  movies: ParsedRecommendation[];
  books: ParsedRecommendation[];
}

export function parseResponse(rawText: string): ParsedRecommendationGroups | null {
  try {
    const clean = rawText
      .replace(/```json|```/gi, "")
      .trim();

    const parsed = JSON.parse(clean);

    if (!Array.isArray(parsed)) {
      throw new Error("Response was not a JSON array");
    }

    const normalized: ParsedRecommendation[] = parsed.map((item) => ({
      title: typeof item.title === "string" ? item.title : "Unknown Title",
      type: item.type === "book" ? "book" : "movie",
      genre: typeof item.genre === "string" ? item.genre : "",
      year:
        typeof item.year === "string"
          ? item.year
          : typeof item.year === "number"
            ? String(item.year)
            : "",
      author: typeof item.author === "string" ? item.author : "",
      description: typeof item.description === "string" ? item.description : "",
      reason: typeof item.reason === "string" ? item.reason : "",
    }));

    return {
      movies: normalized.filter((item) => item.type === "movie"),
      books: normalized.filter((item) => item.type === "book"),
    };
  } catch (err: unknown) {
    console.error(
      "ResponseParser failed:",
      (err as Error).message,
      "\nRaw text:",
      rawText
    );
    return null;
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
    no_results:
      "No recommendations found for those preferences. Try a different mood or genre.",
    parse_failed: "We had trouble reading the AI response. Please try again.",
    api_error:
      "Could not reach the recommendation service. Please try again shortly.",
  };

  return messages[context] ?? "Something went wrong. Please try again.";
}

interface ParseResult {
  data: ParsedRecommendationGroups | null;
  errorMessage: string | null;
}

export function parseResponseWithError(rawText: string): ParseResult {
  const data = parseResponse(rawText);

  if (data === null) {
    return { data: null, errorMessage: buildErrorMessage("parse_failed") };
  }

  if (data.movies.length === 0 && data.books.length === 0) {
    return { data: null, errorMessage: buildErrorMessage("no_results") };
  }

  return { data, errorMessage: null };
}