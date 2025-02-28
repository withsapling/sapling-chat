import { html } from "@sapling/sapling";

export function ApiKeyInput() {
  return html`
    <div class="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <div class="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 class="text-2xl font-bold text-center mb-6">
          Enter Your Gemini API Key
        </h2>
        <p class="text-gray-600 mb-6 text-center">
          To use this chat interface, you'll need to provide your own Gemini API
          key. You can get one from the
          <a
            href="https://aistudio.google.com/app/apikey"
            class="text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
            >Google AI Studio</a
          >. This is saved locally in your browser.
        </p>
        <form id="api-key-form" class="space-y-4">
          <div>
            <label
              for="api-key"
              class="block text-sm font-medium text-gray-700 mb-1"
              >API Key</label
            >
            <input
              type="password"
              id="api-key"
              name="api-key"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your API key"
              required
            />
          </div>
          <button
            type="submit"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Save API Key
          </button>
        </form>
      </div>
    </div>
  `;
}
