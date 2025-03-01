import { Sapling, serveStatic, type Context } from "@sapling/sapling";
import NotFoundLayout from "./layouts/NotFoundLayout.ts";
import { Home } from "./pages/Home.ts";
import { SaplingChat } from "./sapling-chat.ts";

const site = new Sapling({
  // this will disable caching for static files in development
  // it is automatically passed in when you run deno task dev
  dev: Deno.env.get("ENV") === "development",
});

// Map to store SaplingChat instances for each API key
const saplingChatInstances = new Map<string, SaplingChat>();

// Helper function to get or create an SaplingChat instance for an API key
async function getSaplingChatInstance(
  apiKey: string,
  modelId?: string
): Promise<SaplingChat | null> {
  if (!apiKey) return null;

  let instance = saplingChatInstances.get(apiKey);
  if (!instance) {
    instance = new SaplingChat({ apiKey, model: modelId });
    try {
      await instance.init();
      saplingChatInstances.set(apiKey, instance);
    } catch (error) {
      console.error("Error initializing SaplingChat instance:", error);
      return null;
    }
  } else if (modelId) {
    // Update model if a different one is requested
    await instance.setModel(modelId);
  }
  return instance;
}

// Middleware to check for API key
async function requireApiKey(c: Context) {
  const apiKey = c.req.headers.get("X-API-Key");
  const modelId = c.req.headers.get("X-Model-Id");
  if (!apiKey) {
    return c.json({ error: "API key is required" }, 401);
  }

  const saplingChat = await getSaplingChatInstance(
    apiKey,
    modelId || undefined
  );
  if (!saplingChat) {
    return c.json({ error: "Invalid API key" }, 401);
  }

  return saplingChat;
}

// API endpoint to send a message and get a response
site.post("/api/chat/message", async (c: Context) => {
  const saplingChat = await requireApiKey(c);
  if (saplingChat instanceof Response) return saplingChat;

  const body = await c.req.json();

  // Type check the request body
  if (
    typeof body !== "object" ||
    body === null ||
    !("message" in body) ||
    typeof body.message !== "string"
  ) {
    return c.json(
      { error: "Invalid request. Expected { message: string }" },
      400
    );
  }

  const { message } = body;

  // Use streaming response
  const stream = await saplingChat.chatStream(message);

  // Set up streaming response
  const encoder = new TextEncoder();
  const bodyStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      } catch (error) {
        console.error("Error streaming response:", error);
        controller.error(error);
      }
    },
  });

  return new Response(bodyStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "X-Content-Type-Options": "nosniff",
    },
  });
});

// API endpoint to reset the chat
site.post("/api/chat/reset", async (c: Context) => {
  const saplingChat = await requireApiKey(c);
  if (saplingChat instanceof Response) return saplingChat;

  await saplingChat.resetChat();
  return c.json({ status: "ok" });
});

// Set up the home page as the default route
site.get("/", async (c: Context) => c.html(await Home()));

// Serve static files
// The location of this is important. It should be the last route you define.
site.get("*", serveStatic({ root: "./static" }));

// 404 Handler
site.notFound(async (c) => c.html(await NotFoundLayout()));

// Register cleanup on server shutdown
addEventListener("unload", () => {
  console.log("Shutting down, cleaning up resources...");
  for (const instance of saplingChatInstances.values()) {
    instance.close();
  }
});

Deno.serve({
  port: 8000,
  onListen: () =>
    console.log(
      `\nSapling Server is running on %chttp://localhost:8000\n`,
      "color: green; font-weight: bold"
    ),
  handler: site.fetch,
});
