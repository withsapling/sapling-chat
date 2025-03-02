import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.min.js";
import { ModelSelector } from "./modelSelector.js";

let selectedImages = [];
const MAX_IMAGES = 3;

// Function to convert File to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Function to save chat history to localStorage
function saveChatHistory(message, isUser = true) {
  const history = JSON.parse(localStorage.getItem("chat_history") || "[]");
  history.push({
    role: isUser ? "user" : "model",
    parts: [{ text: message }],
  });
  localStorage.setItem("chat_history", JSON.stringify(history));
}

// Function to load chat history from localStorage
function loadChatHistory() {
  return JSON.parse(localStorage.getItem("chat_history") || "[]");
}

document.addEventListener("DOMContentLoaded", async () => {
  const chatContainer = document.getElementById("chat-container");
  const apiKeyContainer = document.getElementById("api-key-container");
  const apiKeyForm = document.getElementById("api-key-form");
  const chatMessages = document.querySelector(
    "#chat-messages .max-w-screen-md"
  );
  const sendButton = document.getElementById("send-button");
  const messageInput = document.getElementById("message-input");
  const resetChatButton = document.getElementById("reset-chat");
  const typingIndicator = document.getElementById("typing-indicator");
  const fileInput = document.getElementById("file-input");
  const attachImageButton = document.getElementById("attach-image");
  const imagePreviewContainer = document.getElementById(
    "image-preview-container"
  );
  const imagePreviews = document.getElementById("image-previews");

  // Initialize model selector
  const modelSelector = new ModelSelector();

  if (
    !chatMessages ||
    !messageInput ||
    !sendButton ||
    !typingIndicator ||
    !chatContainer ||
    !apiKeyContainer ||
    !apiKeyForm ||
    !fileInput ||
    !attachImageButton ||
    !imagePreviewContainer ||
    !imagePreviews
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

    // Load and display chat history
    const history = loadChatHistory();
    history.forEach((message) => {
      addMessage(message.parts[0].text, [], message.role === "user");
    });
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
  };

  // Add input event listener for all devices
  messageInput.addEventListener("input", updateInputState);

  // Force initial state update
  updateInputState();

  // Function to add a message to the chat
  function addMessage(text, images = [], isUser = false) {
    const messageContainer = document.createElement("div");
    messageContainer.className =
      "message-container flex items-start gap-4 w-full";

    if (!isUser) {
      const logoTemplate = document.getElementById("logo-template");
      if (logoTemplate) {
        const logoClone = logoTemplate.content.cloneNode(true);
        messageContainer.appendChild(logoClone);
      }
    }

    const messageDiv = document.createElement("div");
    messageDiv.className = `message flex-1 ${
      isUser ? "user-message" : "model-message"
    }`;

    // Add images if present
    if (images && images.length > 0) {
      // Get the template
      const imageTemplate = document.getElementById("message-images-template");
      const imageContainer = imageTemplate.content
        .cloneNode(true)
        .querySelector("div");
      const templateImg = imageContainer.querySelector("img");

      images.forEach((imageData, index) => {
        const img = index === 0 ? templateImg : templateImg.cloneNode(true);
        img.src = imageData;
        if (index > 0) {
          imageContainer.appendChild(img);
        }
      });

      messageDiv.appendChild(imageContainer);
    }

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
    if (!message && selectedImages.length === 0) return;

    // Convert images to base64
    const imageData = await Promise.all(selectedImages.map(fileToBase64));

    // Add message to chat with images and save to history
    addMessage(message, imageData, true);
    saveChatHistory(message, true);
    messageInput.style.height = "auto";

    // Clear images immediately after adding to chat
    const imagesToSend = [...selectedImages]; // Create a copy of the images array
    selectedImages = [];
    updatePreviews();

    typingIndicator.style.display = "block";

    try {
      const response = await fetch("/api/chat/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": localStorage.getItem("gemini_api_key"),
          "X-Model-Id": modelSelector.getCurrentModel(),
        },
        body: JSON.stringify({
          message,
          images: imageData,
          history: loadChatHistory(), // Send chat history with the request
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("gemini_api_key");
          apiKeyContainer.classList.add("active");
          chatContainer.classList.remove("active");
        }
        throw new Error(`API error: ${response.status}`);
      }

      const messageDiv = addMessage("", [], false);
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

      // Save the model's response to history
      saveChatHistory(accumulatedText, false);
    } catch (error) {
      console.error("Error sending message:", error);
      addMessage(`Error: ${error.message}`, [], false);
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

      // Clear all messages
      while (chatMessages.children.length > 1) {
        chatMessages.removeChild(chatMessages.children[0]);
      }

      // Clear chat history from localStorage
      localStorage.removeItem("chat_history");

      console.log("Chat reset successfully");
    } catch (error) {
      console.error("Error resetting chat:", error);
    }
  }

  // Event listeners
  sendButton.addEventListener("click", () => {
    const message = messageInput.value.trim();
    if (!message) return; // Don't send empty messages
    sendMessage(message);
    messageInput.value = "";
  });

  messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const message = messageInput.value.trim();
      if (!message) return; // Don't send empty messages
      sendButton.click();
    }
  });

  resetChatButton.addEventListener("click", resetChat);

  // Function to create image preview element
  function createImagePreview(file, index) {
    const template = document.getElementById("image-preview-template");
    const previewElement = template.content.cloneNode(true);

    const img = previewElement.querySelector("img");
    const removeButton = previewElement.querySelector("button");

    // Set up image preview
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);

    // Set up remove button
    removeButton.onclick = () => {
      selectedImages = selectedImages.filter((_, i) => i !== index);
      updatePreviews();
    };

    return previewElement;
  }

  // Function to update all previews
  function updatePreviews() {
    imagePreviews.innerHTML = "";
    selectedImages.forEach((file, index) => {
      imagePreviews.appendChild(createImagePreview(file, index));
    });
    imagePreviewContainer.classList.toggle(
      "hidden",
      selectedImages.length === 0
    );
  }

  // Handle file selection
  fileInput.addEventListener("change", (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = MAX_IMAGES - selectedImages.length;

    if (remainingSlots > 0) {
      const newImages = files
        .filter((file) => file.type.startsWith("image/"))
        .slice(0, remainingSlots);

      selectedImages = [...selectedImages, ...newImages];
      updatePreviews();
    }

    // Clear the input to allow selecting the same file again
    fileInput.value = "";
  });

  // Handle image attachment button
  attachImageButton.addEventListener("click", () => {
    if (selectedImages.length < MAX_IMAGES) {
      fileInput.click();
    }
  });

  // Handle paste events for images
  messageInput.addEventListener("paste", (e) => {
    e.preventDefault();

    // Get pasted items
    const items = (e.clipboardData || window.clipboardData).items;

    // Process pasted content
    for (const item of items) {
      // Check if item is an image
      if (item.type.indexOf("image") !== -1) {
        // Check if we can add more images
        if (selectedImages.length >= MAX_IMAGES) {
          break;
        }

        const file = item.getAsFile();
        if (file) {
          selectedImages.push(file);
          updatePreviews();
        }
      } else if (item.type === "text/plain") {
        // Handle pasted text normally
        item.getAsString((text) => {
          const start = messageInput.selectionStart;
          const end = messageInput.selectionEnd;
          const currentValue = messageInput.value;
          messageInput.value =
            currentValue.substring(0, start) +
            text +
            currentValue.substring(end);
          messageInput.selectionStart = messageInput.selectionEnd =
            start + text.length;
        });
      }
    }
  });
});
