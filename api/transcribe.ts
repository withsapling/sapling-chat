import { Context } from "@sapling/sapling";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Buffer } from "node:buffer";
import { transcribeAudioPrompt } from "./prompts.ts";

export async function geminiFlashTranscribe(c: Context) {
  try {
    const formData = await c.req.formData();
    const audioFile = formData.get("audio") as File;
    const apiKey = formData.get("apiKey") as string;

    if (!audioFile) {
      return c.json({ error: "No audio file provided" }, 400);
    }

    if (!apiKey) {
      return c.json({ error: "API key is required" }, 401);
    }

    // Convert the audio file to base64
    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString("base64");

    const googleAIClient = new GoogleGenerativeAI(apiKey);
    const model = googleAIClient.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: transcribeAudioPrompt,
      generationConfig: {
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            transcription: { type: SchemaType.STRING, nullable: true },
            error: { type: SchemaType.STRING, nullable: true },
          },
          required: ["transcription"],
        },
      },
    });

    try {
      const result = await model.generateContent([
        {
          inlineData: {
            data: base64Audio,
            mimeType: audioFile.type,
          },
        },
        {
          text: "Transcribe this audio file.",
        },
      ]);

      const response = await result.response;
      const content = response.text();
      const jsonContent = JSON.parse(content);
      // Check if the content is the error message
      if (jsonContent.error) {
        return c.json({ error: jsonContent.error });
      }

      return c.json({ transcription: jsonContent.transcription });
    } catch (error) {
      console.error("Error in transcription:", error);
      return c.json({ error: "Transcription failed" }, 500);
    }
  } catch (error) {
    console.error("Error in transcription:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
}
