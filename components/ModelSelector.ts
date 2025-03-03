import { html } from "@sapling/sapling";

export const THINKING_MODEL_ID = "gemini-2.0-flash-thinking-exp-01-21";
export const DEFAULT_MODEL_ID = "gemini-2.0-flash-lite";

export const AVAILABLE_MODELS = [
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    description: "Fast and efficient for everyday tasks",
  },
  {
    id: "gemini-2.0-flash-lite",
    name: "Gemini 2.0 Flash Lite",
    description: "Lightweight and fast for basic tasks",
  },
  {
    id: "gemini-2.0-pro-exp-02-05",
    name: "Gemini 2.0 Pro Exp",
    description: "Most powerful model for sophisticated needs",
  },
  {
    id: "gemini-2.0-flash-thinking-exp-01-21",
    name: "Gemini 2.0 Flash Thinking",
    description: "Reasoning and planning for complex tasks",
  },
];

export function ModelSelector() {
  return html`
    <div class="relative inline-block text-left">
      <div
        id="model-selector-button"
        class="flex items-start gap-2 cursor-pointer"
      >
        <span
          id="selected-model-name"
          class="text-sm text-gray-500 max-w-[120px] truncate whitespace-nowrap overflow-hidden"
          title="Gemini 2.0 Flash"
          >Gemini 2.0 Flash</span
        >
        <button
          class="bg-transparent border-none cursor-pointer text-gray-400 hover:text-gray-600 @dark:hover:text-gray-300 flex items-center"
        >
          <iconify-icon icon="mdi:chevron-down" width="20"></iconify-icon>
        </button>
      </div>

      <div
        id="model-dropdown"
        class="hidden absolute right-0 bottom-full mb-2 w-72 rounded-lg bg-white @dark:bg-black shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
      >
        <div class="p-2 space-y-1">
          ${AVAILABLE_MODELS.map(
            (model) => html`
              <button
                class="group flex w-full rounded-md px-3 py-2 text-sm text-left text-gray-700 @dark:text-gray-200 hover:bg-gray-100 @dark:hover:bg-gray-800 hover:text-gray-900 @dark:hover:text-gray-100"
                data-model-id="${model.id}"
              >
                <div class="flex-1">
                  <p class="font-medium">${model.name}</p>
                  <p class="text-xs text-gray-500">${model.description}</p>
                </div>
                <span
                  class="model-check ml-2 opacity-0 group-data-[selected=true]:opacity-100"
                >
                  <iconify-icon icon="mdi:check" width="20"></iconify-icon>
                </span>
              </button>
            `
          )}
        </div>
      </div>
    </div>
  `;
}
