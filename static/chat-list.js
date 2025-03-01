import {
  LitElement,
  html,
} from "https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js";
import { ChatDB } from "./db.js";

export class ChatListComponent extends LitElement {
  static properties = {
    chats: { type: Array },
    loading: { type: Boolean },
  };

  // Opt out of shadow DOM to use Tailwind classes
  createRenderRoot() {
    return this;
  }

  constructor() {
    super();
    this.chats = [];
    this.loading = true;
    this.db = new ChatDB();
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.db.init();
    await this.loadChats();
  }

  async loadChats() {
    this.loading = true;
    this.chats = await this.db.getAllChats();
    this.loading = false;
  }

  async handleDelete(e, chatId) {
    e.preventDefault();
    await this.db.deleteChat(chatId);
    await this.loadChats();
  }

  async handleNewChat() {
    const chat = await this.db.createChat();
    window.location.href = `/chat/${chat.id}`;
  }

  render() {
    if (this.loading) {
      return html`<div class="text-center py-8 px-4">Loading...</div>`;
    }

    if (this.chats.length === 0) {
      return html`
        <div class="text-center text-gray-500 py-8 px-4">
          No chats yet. Start a new conversation!
        </div>
      `;
    }

    return html`
      ${this.chats.map(
        (chat) => html`
          <a
            href="/chat/${chat.id}"
            class="block p-4 hover:bg-gray-50 @dark:hover:bg-gray-800 border-b border-gray-200 @dark:border-gray-800"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-medium">${chat.title}</h3>
                <p class="text-sm text-gray-500">
                  ${new Date(chat.timestamp).toLocaleString()}
                </p>
              </div>
              <button
                class="text-red-500 hover:text-red-700"
                @click=${(e) => this.handleDelete(e, chat.id)}
              >
                <iconify-icon icon="mdi:delete" width="20"></iconify-icon>
              </button>
            </div>
          </a>
        `
      )}
    `;
  }
}

customElements.define("chat-list-component", ChatListComponent);
