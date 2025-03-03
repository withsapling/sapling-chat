import { html } from "@sapling/sapling";

export function Nav() {
  return html`
    <nav class="backdrop-blur-sm sticky top-0 z-50">
      <div class="flex justify-between items-center p-4">
        <h1 class="text-2xl font-bold">Chat</h1>

        <div class="flex items-center space-x-2">
          <button
            id="reset-chat"
            class="inline-flex items-center px-3 py-2 bg-background border border-gray-300 @dark:border-gray-700 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 @dark:text-gray-200  hover:bg-gray-50 @dark:hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black @dark:focus:ring-white"
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
    </nav>
  `;
}
