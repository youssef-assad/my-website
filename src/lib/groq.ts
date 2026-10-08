import Groq from "groq-sdk";

export function getGroqClient(): Groq {
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}
