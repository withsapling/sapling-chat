import { html } from "@sapling/sapling";
import Layout from "../layouts/Layout.ts";
import { ChatInput } from "../components/ChatInput.ts";
import { ApiKeyInput } from "../components/ApiKeyInput.ts";
import { Logo } from "../components/Logo.ts";

export async function Home() {
  return await Layout({
    title: "Sapling Chat",
    description: "An open source chat app built with Sapling",
    head: html`
      <style>
        .typing-indicator {
          display: none;
        }
        .typing-indicator span {
          display: inline-block;
          width: 8px;
          height: 8px;
          background-color: #9ca3af;
          border-radius: 50%;
          margin-right: 5px;
          animation: typing 1s infinite;
        }
        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes typing {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        .message-container {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          gap: 1rem;
          width: 100%;
          padding: 0.5rem 0;
        }

        .message {
          max-width: 85%;
          border-radius: 1.5rem;
          word-break: break-word;
        }

        .prose > :first-child {
          margin-top: 0;
        }

        .user-message {
          max-width: fit-content;
          padding: 0.625rem 1.25rem;
          margin-left: auto;
          background-color: hsla(0, 0%, 0%, 0.05);
        }
        .model-message {
          margin-right: auto;
          background-color: transparent;
          padding-left: 0;
        }

        #message-input.drag-over {
          border: 1px dotted var(--color-primary, #000);
          background-color: hsla(0, 0%, 0%, 0.05);
          @media (prefers-color-scheme: dark) {
            background-color: hsla(0, 0%, 100%, 0.1);
          }
        }

        #chat-container {
          display: none;
        }

        #chat-container.active {
          display: flex;
        }

        #api-key-container {
          display: none;
        }

        #api-key-container.active {
          display: block;
        }

        @media (prefers-color-scheme: dark) {
          .user-message {
            background-color: hsla(0, 0%, 100%, 0.25);
          }
        }
      </style>
      <script type="module" src="/scripts/chat.js"></script>
    `,
    children: html`
      <div class="max-w-screen-md mx-auto p-4">
        <div id="api-key-container">${ApiKeyInput()}</div>

        <div id="chat-container" class="flex-col min-h-[calc(100dvh-100px)]">
          <div class="flex justify-between items-center mb-4">
            <h1 class="text-2xl font-bold">Chat</h1>
            <template>
              <div class="prose prose-sm max-w-none"></div>
            </template>
            <template id="logo-template">
              <div
                class="flex-shrink-0 bg-gray-100 @dark:bg-gray-900 border border-gray-200 @dark:border-gray-800 rounded-full p-2"
              >
                ${Logo({ width: 18, height: 18 })}
              </div>
            </template>

            <template id="message-images-template">
              <div class="flex gap-2 mb-2">
                <img
                  class="h-24 w-24 object-cover rounded-sm"
                  alt="Attached image"
                />
              </div>
            </template>

            <div class="flex items-center space-x-2">
              <button
                id="reset-chat"
                class="inline-flex items-center px-3 py-2 border border-gray-300 @dark:border-gray-700 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 @dark:text-gray-200 bg-white @dark:bg-black hover:bg-gray-50 @dark:hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black @dark:focus:ring-white"
              >
                <iconify-icon
                  icon="mdi:refresh"
                  class="mr-2"
                  width="16"
                ></iconify-icon>
                Reset Chat
              </button>
            </div>
          </div>

          <div
            id="chat-messages"
            class="flex-1 overflow-y-auto space-y-4 mb-22"
          >
            <div class="max-w-screen-md mx-auto space-y-4">
              <div id="typing-indicator" class="hidden">
                <div class="message model-message">
                  <div class="typing-animation">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            class="fixed bottom-0 left-0 right-0 bg-white @dark:bg-black border-gray-200 @dark:border-gray-800"
          >
            <div class="max-w-screen-md mx-auto">${ChatInput()}</div>
          </div>
        </div>
      </div>
    `,
  });
}
