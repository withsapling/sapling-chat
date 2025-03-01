import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";
import { ModelSelector } from "./modelSelector.js";

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

  // Initialize model selector
  const modelSelector = new ModelSelector();

  if (
    !chatMessages ||
    !messageInput ||
    !sendButton ||
    !typingIndicator ||
    !chatContainer ||
    !apiKeyContainer ||
    !apiKeyForm
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

  // Function to update button state and textarea height
  const updateInputState = () => {
    messageInput.style.height = "auto";
    messageInput.style.height = messageInput.scrollHeight + "px";
    const hasValue = messageInput.value.trim().length > 0;
    console.log("Input value:", messageInput.value, "Has value:", hasValue);
    sendButton.disabled = !hasValue;
  };

  // Add input event listener for all devices
  messageInput.addEventListener("input", updateInputState);

  // Function to add a message to the chat
  function addMessage(text, isUser = false) {
    const messageContainer = document.createElement("div");
    messageContainer.className =
      "message-container flex items-start gap-4 w-full";

    if (!isUser) {
      const logoDiv = document.createElement("div");
      logoDiv.className =
        "flex-shrink-0 mt-2 bg-gray-100 @dark:bg-gray-900 border border-gray-200 @dark:border-gray-800  rounded-full p-2";
      logoDiv.innerHTML = `<svg width="18" height="18" viewBox="0 0 152 215" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-black @dark:text-white">
        <path d="M67.0679 96.2193L19.8254 143.916C17.8971 145.863 15.6475 146.796 13.0764 146.715C10.5054 146.634 8.25576 145.62 6.32749 143.673C4.55991 141.726 3.63595 139.455 3.5556 136.859C3.47526 134.263 4.39922 131.992 6.32749 130.045L69.9603 65.8004C70.9245 64.827 71.969 64.1375 73.0938 63.7319C74.2186 63.3263 75.4238 63.1235 76.7093 63.1235C77.9948 63.1235 79.2 63.3263 80.3248 63.7319C81.4496 64.1375 82.4941 64.827 83.4582 65.8004L147.091 130.045C148.859 131.83 149.742 134.06 149.742 136.737C149.742 139.414 148.859 141.726 147.091 143.673C145.163 145.62 142.873 146.593 140.222 146.593C137.57 146.593 135.28 145.62 133.352 143.673L86.3506 96.2193V204.997C86.3506 207.755 85.4267 210.067 83.5787 211.933C81.7308 213.798 79.441 214.731 76.7093 214.731C73.9776 214.731 71.6878 213.798 69.8398 211.933C67.9919 210.067 67.0679 207.755 67.0679 204.997V96.2193Z" fill="currentColor"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M75.7334 18.0371L137.326 79.6299C140.561 82.8648 145.806 82.8648 149.041 79.6299C152.275 76.3951 152.275 71.1504 149.041 67.9155L84.9375 3.81249C79.8542 -1.27084 71.6125 -1.27082 66.5292 3.8125L2.42613 67.9155C-0.808711 71.1504 -0.808711 76.3951 2.42613 79.6299C5.66098 82.8648 10.9057 82.8648 14.1405 79.6299L75.7334 18.0371Z" fill="currentColor"/>
      </svg>`;
      messageContainer.appendChild(logoDiv);
    }

    const messageDiv = document.createElement("div");
    messageDiv.className = `message flex-1 ${
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
    }

    messageContainer.appendChild(messageDiv);
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

    // Add user message to chat
    addMessage(message, true);
    messageInput.style.height = "auto";
    typingIndicator.style.display = "block";
    // Reset the submit button state
    sendButton.disabled = true;

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
    } catch (error) {
      console.error("Error sending message:", error);
      addMessage(`Error: ${error.message}`, false);
    } finally {
      typingIndicator.style.display = "none";
      // Reset the submit button state based on input value
      sendButton.disabled = !messageInput.value.trim();
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

      // Clear all messages
      while (chatMessages.children.length > 1) {
        chatMessages.removeChild(chatMessages.children[0]);
      }

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
    // Update button state after clearing input
    sendButton.disabled = true;
  });

  messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendButton.click();
    }
  });

  resetChatButton.addEventListener("click", resetChat);
});
