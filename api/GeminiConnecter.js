import { GoogleGenAI } from "@google/genai";
import { dotenv } from 'dotenv';
import { GeneralPrompt, VariablePrompt } from './GeminiPrompt';


dotenv.config();

const ai = new GoogleGenAI({});