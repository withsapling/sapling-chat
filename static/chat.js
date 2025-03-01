import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";
import { ModelSelector } from "./modelSelector.js";
import { ChatDB } from "./db.js";

document.addEventListener("DOMContentLoaded", async () => {
  const chatContainer = document.getElementById("chat-container");
  const apiKeyContainer = document.getElementById("api-key-container");
  const apiKeyForm = document.getElementById("api-key-form");
  const chatMessages = document.querySelector(
    "#chat-messages .max-w-screen-md"
  );
  const messageInput = document.getElementById("message-input");
  const sendButton = document.getElementById("send-button");
  const resetChatButton = document.getElementById("reset-chat");
  const typingIndicator = document.getElementById("typing-indicator");
  const chatId = chatContainer?.dataset.chatId;

  // Initialize model selector and database
  const modelSelector = new ModelSelector();
  const db = new ChatDB();
  await db.init();

  if (
    !chatMessages ||
    !messageInput ||
    !sendButton ||
    !typingIndicator ||
    !chatContainer ||
    !apiKeyContainer ||
    !apiKeyForm ||
    !chatId
  ) {
    console.error("Required elements not found");
    return;
  }

  // Configure marked options
  marked.setOptions({
    breaks: true,
    gfm: true,
    sanitize: true,
  });

  // Check for stored API key and show appropriate interface
  const storedApiKey = localStorage.getItem("gemini_api_key");
  if (storedApiKey) {
    chatContainer.classList.add("active");
    // Load existing chat messages
    const chat = await db.getChat(chatId);
    if (chat) {
      chat.messages.forEach((msg) => {
        addMessage(msg.text, msg.isUser);
      });
    }
  } else {
    apiKeyContainer.classList.add("active");
  }

  // Handle API key form submission
  apiKeyForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const apiKey = e.target.elements["api-key"].value.trim();
    if (apiKey) {
      localStorage.setItem("gemini_api_key", apiKey);
      apiKeyContainer.classList.remove("active");
      chatContainer.classList.add("active");
    }
  });

  // Auto-resize textarea as user types
  messageInput.addEventListener("input", function () {
    this.style.height = "auto";
    this.style.height = this.scrollHeight + "px";
  });

  // Function to add a message to the chat
  function addMessage(text, isUser = false) {
    const messageContainer = document.createElement("div");
    messageContainer.className = "message-container";

    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${
      isUser ? "user-message" : "model-message"
    }`;

    if (isUser) {
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      messageDiv.appendChild(paragraph);
    } else {
      const markdownDiv = document.createElement("div");
      markdownDiv.className = "prose prose-sm max-w-none";
      markdownDiv.innerHTML = marked.parse(text);
      messageDiv.appendChild(markdownDiv);
      messageContainer.appendChild(messageDiv);
    }

    if (!messageContainer.hasChildNodes()) {
      messageContainer.appendChild(messageDiv);
    }

    chatMessages.insertBefore(messageContainer, typingIndicator);
    return messageDiv;
  }

  // Function to send a message to the API
  async function sendMessage(message) {
    if (!message.trim()) return;

    const apiKey = localStorage.getItem("gemini_api_key");
    if (!apiKey) {
      addMessage(
        "Error: No API key found. Please provide your API key.",
        false
      );
      apiKeyContainer.classList.add("active");
      chatContainer.classList.remove("active");
      return;
    }

    // Add user message to chat and database
    addMessage(message, true);
    await db.updateChat(chatId, {
      messages: (
        await db.getChat(chatId)
      )?.messages.concat([{ text: message, isUser: true }]) || [
        { text: message, isUser: true },
      ],
    });

    messageInput.style.height = "auto";
    typingIndicator.style.display = "block";

    try {
      const response = await fetch("/api/chat/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
          "X-Model-Id": modelSelector.getCurrentModel(),
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("gemini_api_key");
          apiKeyContainer.classList.add("active");
          chatContainer.classList.remove("active");
        }
        throw new Error(`API error: ${response.status}`);
      }

      const messageDiv = addMessage("", false);
      const contentDiv = messageDiv.querySelector(".prose");
      let accumulatedText = "";

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        accumulatedText += text;
        contentDiv.innerHTML = marked.parse(accumulatedText);
      }

      // Save model response to database
      await db.updateChat(chatId, {
        messages: (
          await db.getChat(chatId)
        )?.messages.concat([{ text: accumulatedText, isUser: false }]) || [
          { text: accumulatedText, isUser: false },
        ],
      });

      // Update chat title if it's still "New Chat"
      const chat = await db.getChat(chatId);
      if (chat && chat.title === "New Chat") {
        await db.updateChat(chatId, {
          title: message.slice(0, 50) + (message.length > 50 ? "..." : ""),
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      addMessage(`Error: ${error.message}`, false);
    } finally {
      typingIndicator.style.display = "none";
    }
  }

  // Function to reset the chat
  async function resetChat() {
    try {
      const apiKey = localStorage.getItem("gemini_api_key");
      const response = await fetch("/api/chat/reset", {
        method: "POST",
        headers: {
          "X-API-Key": apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      while (chatMessages.children.length > 2) {
        chatMessages.removeChild(chatMessages.children[1]);
      }

      // Clear chat messages in database
      await db.updateChat(chatId, {
        messages: [],
        title: "New Chat",
      });

      console.log("Chat reset successfully");
    } catch (error) {
      console.error("Error resetting chat:", error);
    }
  }

  // Event listeners
  sendButton.addEventListener("click", () => {
    const message = messageInput.value;
    sendMessage(message);
    messageInput.value = "";
  });

  messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendButton.click();
    }
  });

  resetChatButton.addEventListener("click", resetChat);
});
