import { GoogleGenAI } from "@google/genai";
import {
  GeneralPrompt,
  VariablePrompt,
  RegeneratePrompt,
  MoreRecommendationsPrompt,
} from "./GeminiPrompt";
import { buildErrorMessage, parseResponseWithError } from "./ResponseParser";

const GeminiConnecter = async (
  requestType: "initial" | "regenerate" | "similar",
  preferences: {
    mood: string;
    genre: string;
    movies: boolean;
    books: boolean;
  },
  likedRecommendation: string | null = null,
  previousTitles: string[] = []
) => {
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return {
      success: false,
      error: "Missing Gemini API key. Check your .env.local file.",
    };
  }

  const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  const { mood, genre, movies, books } = preferences;

  let userPrompt: string;

  switch (requestType) {
    case "regenerate":
      userPrompt =
        VariablePrompt(mood, genre, movies, books) +
        "\n\n" +
        RegeneratePrompt +
        (previousTitles.length > 0
          ? `\n\nDo NOT recommend any of these titles: ${previousTitles.join(", ")}`
          : "");
      break;

    case "similar":
      userPrompt =
        VariablePrompt(mood, genre, movies, books) +
        "\n\n" +
        (likedRecommendation
          ? MoreRecommendationsPrompt(likedRecommendation)
          : "");
      break;

    case "initial":
    default:
      userPrompt = VariablePrompt(mood, genre, movies, books);
      break;
  }

  const fullPrompt = GeneralPrompt + "\n\n" + userPrompt;

  console.log("Gemini request type:", requestType);
  console.log("Preferences:", preferences);
  console.log("Full prompt:", fullPrompt);

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: fullPrompt,
    });

    console.log("Raw Gemini response:", response);
    console.log("Raw Gemini text:", response.text);

    if (typeof response.text !== "undefined") {
      const parsedResult = parseResponseWithError(response.text);
      console.log("Parsed result:", parsedResult);

      if (parsedResult.errorMessage) {
        return { success: false, error: parsedResult.errorMessage };
      }

      return { success: true, recommendations: parsedResult.data };
    }

    return {
      success: false,
      error: "Gemini returned no text response.",
    };
  } catch (err: unknown) {
    console.error("Gemini API error:", err);

    let errorMessage =
      "Could not reach the recommendation service. Please try again shortly.";

    if (err instanceof Error) {
      errorMessage = err.message;
    }

    return { success: false, error: errorMessage || buildErrorMessage("api_error") };
  }
};

export default GeminiConnecter;