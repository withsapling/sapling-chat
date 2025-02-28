import { html } from "@sapling/sapling";

export function ScrollToBottom() {
  return html`
    <sapling-island>
      <button
        id="scroll-to-bottom"
        class="fixed bottom-28 right-8 bg-white shadow-lg rounded-full p-3 transition-opacity duration-200 hover:bg-gray-50 z-50 flex items-center justify-center"
        aria-label="Scroll to bottom"
      >
        <iconify-icon icon="mdi:chevron-down" width="24"></iconify-icon>
      </button>
      <template>
        <script type="module">
          export default function () {
            const scrollButton = document.getElementById("scroll-to-bottom");
            const chatMessages = document.getElementById("chat-messages");

            if (!scrollButton || !chatMessages) return;

            const showScrollButton = () => {
              const isScrolledUp =
                chatMessages.scrollTop <
                chatMessages.scrollHeight - chatMessages.clientHeight - 100;
              scrollButton.style.display = isScrolledUp ? "flex" : "none";
            };

            // Initial check
            showScrollButton();

            chatMessages.addEventListener("scroll", showScrollButton);

            // Also check when new messages are added
            const observer = new MutationObserver(showScrollButton);
            observer.observe(chatMessages, { childList: true, subtree: true });

            scrollButton.addEventListener("click", () => {
              chatMessages.scrollTo({
                top: chatMessages.scrollHeight,
                behavior: "smooth",
              });
            });

            // Cleanup function
            return () => {
              chatMessages.removeEventListener("scroll", showScrollButton);
              observer.disconnect();
              scrollButton.removeEventListener("click", () => {});
            };
          }
        </script>
      </template>
    </sapling-island>
  `;
}
