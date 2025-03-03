interface MessagePart {
  text?: string;
  inlineData?: {
    data: string;
    mimeType: string;
  };
}

interface ChatMessage {
  role: string;
  parts: MessagePart[];
}

export class SaplingChat {
  private chatModel: any;
  private model: any;

  private history: ChatMessage[] = [];

  private apiKey: string;
  private currentModel: string;

  constructor(options: { apiKey?: string; model?: string } = {}) {
    this.apiKey = options.apiKey || Deno.env.get("GEMINI_API_KEY") || "";
    this.currentModel = options.model || "gemini-2.0-flash-lite";
    if (!this.apiKey) {
      console.warn("No API key provided. Please provide a Gemini API key.");
    }
  }

  /**
   * Initialize the chat model
   */
  async init(initialHistory?: ChatMessage[]) {
    if (!this.apiKey) {
      throw new Error("No API key provided. Please provide a Gemini API key.");
    }

    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = genAI.getGenerativeModel({ model: this.currentModel });

      // Initialize chat with provided history or default history
      this.history = initialHistory || [
        {
          role: "user",
          parts: [{ text: "Hello" }],
        },
        {
          role: "model",
          parts: [{ text: "Great to meet you. How can I help you today?" }],
        },
      ];

      this.chatModel = this.model.startChat({
        history: this.history,
      });

      return true;
    } catch (error) {
      console.error("Error initializing chat:", error);
      throw error;
    }
  }

  /**
   * Change the model being used
   * @param modelId The ID of the model to use
   */
  async setModel(modelId: string) {
    if (this.currentModel === modelId) return;

    this.currentModel = modelId;
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = genAI.getGenerativeModel({ model: modelId });

    // Reinitialize chat with existing history
    this.chatModel = this.model.startChat({
      history: this.history,
    });
  }

  /**
   * Send a message to the chat and get a response
   * @param message The message to send
   * @returns The response from the model
   */
  async sendMessage(message: string): Promise<string> {
    if (!this.chatModel) {
      await this.init();
    }

    try {
      // Add user message to history
      this.history.push({
        role: "user",
        parts: [{ text: message }],
      });

      // Send message to model
      const result = await this.chatModel.sendMessage(message);
      const response = result.response.text();

      // Add model response to history
      this.history.push({
        role: "model",
        parts: [{ text: response }],
      });

      return response;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  /**
   * Send a message to the chat and get a streaming response
   * @param message The message to send
   * @param images Optional array of base64 encoded images
   * @returns A stream of response chunks
   */
  async chatStream(message: string, images?: string[]) {
    if (!this.chatModel) {
      await this.init();
    }

    try {
      // Prepare the content parts array
      const parts: MessagePart[] = [];

      // Add images if present
      if (images?.length) {
        parts.push(
          ...images.map((img) => ({
            inlineData: {
              data: img.split(",")[1], // Remove the data URL prefix
              mimeType: "image/jpeg",
            },
          }))
        );
      }

      // Add the text message if present
      if (message?.trim()) {
        parts.push({ text: message });
      }

      // Add user message to history
      this.history.push({
        role: "user",
        parts,
      });

      // Send message to model and get streaming response
      const result = await this.chatModel.sendMessageStream(parts);

      // We'll collect the full response to add to history after streaming
      let fullResponse = "";

      // Return the stream for the caller to consume
      const stream = {
        [Symbol.asyncIterator]: async function* (this: SaplingChat) {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullResponse += chunkText;
            yield chunkText;
          }

          // After streaming is complete, add the full response to history
          this.history.push({
            role: "model",
            parts: [{ text: fullResponse }],
          });
        }.bind(this),
      };

      return stream;
    } catch (error) {
      console.error("Error sending message stream:", error);
      throw error;
    }
  }

  /**
   * Reset the chat history
   */
  async resetChat() {
    this.history = [
      {
        role: "user",
        parts: [{ text: "Hello" }],
      },
      {
        role: "model",
        parts: [{ text: "Great to meet you. How can I help you today?" }],
      },
    ];

    if (this.model) {
      this.chatModel = this.model.startChat({
        history: this.history,
      });
    }

    return true;
  }

  /**
   * Get the current chat history
   */
  getHistory() {
    return this.history;
  }

  /**
   * Close any resources
   */
  close() {
    // Currently no resources to close for the chat model
    // This will be used later for browser automation
    return true;
  }
}
