import { html } from "@sapling/sapling";
import { ModelSelector } from "./ModelSelector.ts";

export function ChatInput() {
  return html`
    <template id="image-preview-template">
      <div class="relative">
        <img class="h-12 w-12 object-cover rounded-md" alt="Preview" />
        <button
          class="absolute -top-2 -right-2 bg-gray-800 @dark:bg-gray-200 text-white @dark:text-black rounded-full w-5 h-5 flex items-center justify-center hover:bg-gray-700 @dark:hover:bg-gray-300"
        >
          <iconify-icon icon="mdi:close" width="12" height="12"></iconify-icon>
        </button>
      </div>
    </template>
    <div class="flex-none bg-background px-4 md:px-0 pb-4">
      <div
        class="flex flex-col rounded-2xl border border-gray-200 @dark:border-gray-800 shadow-sm @dark:shadow-gray-800"
      >
        <div id="image-preview-container" class="hidden px-4 pt-3">
          <div class="flex items-start gap-2">
            <div id="image-previews" class="flex gap-2">
              <!-- Preview items will be added here dynamically -->
            </div>
          </div>
        </div>
        <div class="flex items-center px-4 py-3">
          <textarea
            id="message-input"
            class="w-full border-none focus:outline-none focus:ring-0 resize-none min-h-[24px] max-h-[200px] overflow-y-auto bg-transparent text-gray-700 @dark:text-gray-200 placeholder-gray-400 @dark:placeholder-gray-500 text-[15px]"
            placeholder="How can I help?"
            rows="1"
          ></textarea>
        </div>

        <div
          class="flex justify-between px-4 py-2 border-t border-gray-100 @dark:border-gray-800"
        >
          <div class="flex items-center gap-2">
            <button
              id="attach-image"
              class="bg-transparent border-none cursor-pointer text-gray-400 hover:text-gray-600 @dark:hover:text-gray-300 flex items-center"
            >
              <input
                type="file"
                id="file-input"
                class="hidden"
                accept="image/*"
                multiple
              />
              <iconify-icon icon="mdi:paperclip" width="20"></iconify-icon>
            </button>

            <button
              id="think-toggle"
              class="inline-flex items-center gap-1 pl-2 pr-3 py-1 rounded-full text-sm text-gray-500 hover:text-gray-700 @dark:hover:text-gray-300 border border-gray-200 @dark:border-gray-800"
            >
              <iconify-icon icon="lucide:lightbulb" width="16"></iconify-icon>
              <span>Think</span>
            </button>
          </div>

          <div class="flex items-center gap-2">
            ${ModelSelector()}

            <button
              id="send-button"
              type="button"
              class="bg-primary text-on-primary p-2 rounded-full flex items-center justify-center hover:bg-gray-800 @dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black @dark:disabled:hover:bg-white"
            >
              <iconify-icon
                icon="material-symbols:arrow-upward-rounded"
                width="20"
              ></iconify-icon>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}
