import { html } from "@sapling/sapling";
import { ModelSelector } from "./ModelSelector.ts";

export function ChatInput() {
  return html`
    <div class="flex-none bg-white @dark:bg-black px-4 md:px-0 pb-4">
      <div
        class="flex flex-col rounded-2xl border border-gray-200 @dark:border-gray-800 shadow-sm @dark:shadow-gray-800"
      >
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
          <button
            class="bg-transparent border-none cursor-pointer text-gray-400 hover:text-gray-600 @dark:hover:text-gray-300 flex items-center"
          >
            <iconify-icon icon="mdi:paperclip" width="20"></iconify-icon>
          </button>

          <div class="flex items-center gap-2">
            ${ModelSelector()}
            <button
              id="send-button"
              type="button"
              class="bg-black @dark:bg-white text-white @dark:text-black p-2 rounded-full flex items-center justify-center hover:bg-gray-800 @dark:hover:bg-gray-100"
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
