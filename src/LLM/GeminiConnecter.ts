import { GoogleGenAI } from "@google/genai";
import { GeneralPrompt, VariablePrompt, RegeneratePrompt, MoreRecommendationsPrompt} from './GeminiPrompt';
import { buildErrorMessage, parseResponseWithError } from "./ResponseParser";

const GEMINI_API_KEY = import.meta.env.GEMINI_API_KEY;

const genAI = new GoogleGenAI({apiKey: GEMINI_API_KEY});

/**
 * GeminiConnecter — handles all three LLM request cases.
 * @param {"initial" | "regenerate" | "similar"} requestType
 * @param {{ mood, genre, movies, books }} preferences
 * @param {string | null} likedRecommendation - only used for "similar" case
 * @param {string[] } previousTitles - used for "regenerate" to avoid repeats
 */
const GeminiConnecter = async (requestType: "initial" | "regenerate" | "similar", preferences: { mood: string; genre: string; movies: boolean; books: boolean }, likedRecommendation: string | null = null, previousTitles: string[] = []) => {
  const { mood, genre, movies, books } = preferences;

  // Build system + user prompt based on request type
  let userPrompt;
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
        (likedRecommendation ? MoreRecommendationsPrompt(likedRecommendation) : "");
      break;

    case "initial":
    default:
      userPrompt = VariablePrompt(mood, genre, movies, books);
      break;
  }

  const fullPrompt = GeneralPrompt + "\n\n" + userPrompt;

  try {
    const response = await genAI.models.generateContent({model: "gemini-3-flash-preview", contents: fullPrompt});
    
    if (typeof response.text !== "undefined") {
      const parsedResult = parseResponseWithError(response.text);
      if (parsedResult.errorMessage) {
        return { success: false, error: parsedResult.errorMessage };
      }
      return { success: true, recommendations: parsedResult.data };
    }

  } catch (err : unknown) {
    console.error("Gemini API error:", err);
    return { success: false, error: buildErrorMessage("api_error")};
  }
};

export default GeminiConnecter;