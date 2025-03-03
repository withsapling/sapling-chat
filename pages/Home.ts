import { html } from "@sapling/sapling";
import Layout from "../layouts/Layout.ts";
import { ChatInput } from "../components/ChatInput.ts";
import { ApiKeyInput } from "../components/ApiKeyInput.ts";
import { Logo } from "../components/Logo.ts";
import { Nav } from "../components/Nav.ts";

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

        .prose code::before {
          content: none;
        }

        .prose code::after {
          content: none;
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

        #think-toggle.active {
          background-color: black;
          color: white;
        }

        /* Voice recording styles */
        #voice-record-button {
          position: relative;
        }

        #voice-record-button.recording {
          background-color: rgb(239 68 68);
        }

        #voice-record-button.recording:hover {
          background-color: rgb(220 38 38);
        }

        @media (prefers-color-scheme: dark) {
          .user-message {
            background-color: hsla(0, 0%, 100%, 0.25);
          }

          #think-toggle.active {
            background-color: white;
            color: black;
          }
        }
      </style>
      <script type="module" src="/scripts/chat.js"></script>
      <script type="module" src="/scripts/copyCode.js"></script>
    `,
    children: html`
      <div class="max-w-screen-md mx-auto">
        ${Nav()}
        <div id="api-key-container">${ApiKeyInput()}</div>

        <div id="chat-container" class="flex-col min-h-[calc(100dvh-100px)]">
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

          <div
            id="chat-messages"
            class="flex-1 overflow-y-auto space-y-4 mb-32"
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

          ${ChatInput()}
        </div>
      </div>
    `,
  });
}
