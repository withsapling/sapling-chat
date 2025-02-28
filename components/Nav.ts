import { html } from "@sapling/sapling";

export function Nav() {
  return html`
    <nav class="backdrop-blur-sm sticky top-0 z-50">
      <div class="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo/Brand -->
          <div class="flex items-center">
            <a href="/" class="flex items-center space-x-2">
              <span class="font-semibold text-xl">Sapling Chat</span>
            </a>
          </div>

          <!-- Navigation Links -->
          <div class="flex items-center space-x-4">
            <button
              id="reset-chat"
              class="flex items-center bg-gray-100 p-2 rounded-full text-sm font-medium transition-colors"
            >
              <iconify-icon
                class="text-black"
                icon="mdi:edit-outline"
                width="20"
              ></iconify-icon>
            </button>
          </div>
        </div>
      </div>
    </nav>
  `;
}
