import { html } from "@sapling/sapling";

export function ChatList() {
  return html`
    <sapling-island>
      <template>
        <!-- we are using the unocss runtime to use the tailwind classes from the web component -->
        <script src="https://cdn.jsdelivr.net/npm/@unocss/runtime"></script>
        <script type="module">
          import "/chat-list.js";

          // Initialize new chat button functionality
          document.querySelectorAll("#new-chat-button").forEach((button) => {
            button.addEventListener("click", async () => {
              const chatList = document.querySelector("chat-list-component");
              await chatList.handleNewChat();
            });
          });
        </script>
      </template>
      <div class="max-w-4xl mx-auto p-4">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold">Your Chats</h1>
          <button
            id="new-chat-button"
            class="bg-black @dark:bg-white text-white @dark:text-black px-4 py-2 rounded-lg hover:bg-gray-800 @dark:hover:bg-gray-200"
          >
            New Chat
          </button>
        </div>
        <div
          class="bg-white overflow-hidden @dark:bg-black rounded-lg border border-gray-200 @dark:border-gray-800 divide-y divide-gray-200 @dark:divide-gray-800"
        >
          <chat-list-component></chat-list-component>
        </div>
      </div>
    </sapling-island>
  `;
}
