import { html } from "@sapling/sapling";

export function ScrollToBottom() {
  return html`
    <button
      id="scroll-to-bottom"
      class="bg-background text-on-background rounded-full pl-3 pr-2 py-2 shadow-lg z-50 hidden flex items-center gap-2 mb-4"
    >
      <span class="text-sm">Scroll to bottom</span>
      <iconify-icon icon="mdi:arrow-down" width="18" height="18"></iconify-icon>
    </button>
  `;
}
