import { html } from "@sapling/sapling";
import Layout from "../layouts/Layout.ts";
import { ChatInput } from "../components/ChatInput.ts";
import { ApiKeyInput } from "../components/ApiKeyInput.ts";

export async function Home() {
  return await Layout({
    title: "Sapling Chat",
    description: "An open source chat app built with Sapling",
    head: html`<style>
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
          flex-direction: column;
          gap: 0.5rem;
          width: 100%;
        }

        .message {
          max-width: 85%;
          padding: 0.625rem 1.25rem;
          border-radius: 1.5rem;
          word-break: break-word;
        }

        .user-message {
          margin-left: auto;
          background-color: hsla(0, 0%, 0%, 0.05);
        }
        .model-message {
          margin-right: auto;
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
      <script
        type="module"
        src="https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js"
      ></script>
      <script type="module" src="/chat.js"></script>`,
    children: html`
      <div id="api-key-container">${ApiKeyInput()}</div>
      <div id="chat-container" class="flex flex-col min-h-screen">
        <template>
          <div aria-hidden="true" class="prose prose-sm max-w-none"></div>
        </template>
        <div id="chat-messages" class="flex-1 overflow-y-auto p-8 space-y-8">
          <div class="max-w-screen-md mx-auto w-full space-y-8">
            <div class="typing-indicator model-message" id="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>

        <div class="sticky bottom-0">
          <div class="max-w-3xl mx-auto">${ChatInput()}</div>
        </div>
      </div>
    `,
  });
}
