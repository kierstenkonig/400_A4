import { GoogleGenAI } from "@google/genai";
import { dotenv } from 'dotenv';
import { GeneralPrompt, VariablePrompt } from './GeminiPrompt';


dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

/**
 * GeminiConnecter — handles all three LLM request cases.
 * @param {"initial" | "regenerate" | "similar"} requestType
 * @param {{ mood, genre, movies, books }} preferences
 * @param {string | null} likedRecommendation - only used for "similar" case
 * @param {string[] } previousTitles - used for "regenerate" to avoid repeats
 */
const GeminiConnecter = async (requestType, preferences, likedRecommendation = null, previousTitles = []) => {
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
        MoreRecommendationsPrompt(likedRecommendation);
      break;

    case "initial":
    default:
      userPrompt = VariablePrompt(mood, genre, movies, books);
      break;
  }

  const fullPrompt = GeneralPrompt + "\n\n" + userPrompt;

  try {
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();
    return { success: true, text };
  } catch (error) {
    console.error("Gemini API error:", error);
    return { success: false, error: error.message || "LLM request failed" };
  }
};

export default GeminiConnecter;