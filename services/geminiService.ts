
import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateRecipe = async (
  ingredients: string[],
  preferences: string[],
  timeLimit: string
): Promise<Recipe> => {
  const prompt = `Generate a high-quality, creative recipe in English using some or all of these ingredients: ${ingredients.join(", ")}. 
  Context: Dietary preferences are ${preferences.join(". ") || "none"}. Time limit is ${timeLimit}. 
  The recipe should sound like it's from a high-end Parisian bistro like Gusteau's from Ratatouille.
  Provide a detailed response with clear steps and nutritional estimation. Use professional but encouraging culinary language.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING ,
            description: "The name of the dish in the format: 'French Name - English Name'."
          },
          description: { type: Type.STRING },
          prepTime: { type: Type.STRING },
          cookTime: { type: Type.STRING },
          difficulty: { type: Type.STRING, enum: ['Easy', 'Medium', 'Advanced'] },
          servings: { type: Type.NUMBER },
          ingredients: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                item: { type: Type.STRING },
                amount: { type: Type.STRING }
              },
              required: ["item", "amount"]
            }
          },
          instructions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                stepNumber: { type: Type.NUMBER },
                instruction: { type: Type.STRING },
                tip: { type: Type.STRING }
              },
              required: ["stepNumber", "instruction"]
            }
          },
          nutritionalInfo: {
            type: Type.OBJECT,
            properties: {
              calories: { type: Type.NUMBER },
              protein: { type: Type.STRING },
              carbs: { type: Type.STRING },
              fat: { type: Type.STRING }
            },
            required: ["calories", "protein", "carbs", "fat"]
          }
        },
        required: ["title", "description", "prepTime", "cookTime", "difficulty", "servings", "ingredients", "instructions", "nutritionalInfo"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateFoodImage = async (recipeTitle: string, description: string): Promise<string> => {
  const prompt = `A beautiful Pixar-style 3D animated rendering of ${recipeTitle}. ${description}. 
  Vibrant colors, cinematic lighting, Disney Ratatouille aesthetic, highly detailed textures, appetizing and warm kitchen atmosphere. 
  Stylized but realistic textures, restaurant quality plating. Include a subtle, friendly mouse chef silhouette in the background if appropriate.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    
    // Check for image data first
    for (const part of parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    // Check if the model returned a reason for refusal (safety filters)
    for (const part of parts) {
      if (part.text) {
        console.warn("Model returned text instead of image:", part.text);
        throw new Error(`Chef's Refusal: ${part.text}`);
      }
    }
    
    throw new Error("The little chef prepared the dish, but it's hidden from view. (No image data returned)");
  } catch (error: any) {
    console.error("Detailed Image Generation Error:", error);
    throw error;
  }
};
