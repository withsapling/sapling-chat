const DB_NAME = "sapling-chat";
const DB_VERSION = 1;
const CHATS_STORE = "chats";

export class ChatDB {
  constructor() {
    this.db = null;
  }

  async init() {
    if (this.db) return;

    // Request persistence
    if (navigator.storage && navigator.storage.persist) {
      const isPersisted = await navigator.storage.persist();
      console.log(`Persisted storage granted: ${isPersisted}`);
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(CHATS_STORE)) {
          const store = db.createObjectStore(CHATS_STORE, { keyPath: "id" });
          store.createIndex("timestamp", "timestamp", { unique: false });
        }
      };
    });
  }

  async createChat() {
    await this.init();
    const id = crypto.randomUUID();
    const chat = {
      id,
      messages: [],
      timestamp: Date.now(),
      title: "New Chat",
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([CHATS_STORE], "readwrite");
      const store = transaction.objectStore(CHATS_STORE);
      const request = store.add(chat);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(chat);
    });
  }

  async getChat(id) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([CHATS_STORE], "readonly");
      const store = transaction.objectStore(CHATS_STORE);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async updateChat(id, updates) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([CHATS_STORE], "readwrite");
      const store = transaction.objectStore(CHATS_STORE);

      // First get the existing chat
      const getRequest = store.get(id);

      getRequest.onerror = () => reject(getRequest.error);
      getRequest.onsuccess = () => {
        const existingChat = getRequest.result || {
          id,
          messages: [],
          timestamp: Date.now(),
          title: "New Chat",
        };

        // Create a new chat object with the updates
        const updatedChat = {
          ...existingChat,
          ...updates,
          // Ensure messages array is properly handled
          messages: updates.messages || existingChat.messages || [],
          // Update timestamp on every change
          timestamp: Date.now(),
        };

        // Put the updated chat back in the store
        const putRequest = store.put(updatedChat);
        putRequest.onerror = () => reject(putRequest.error);
        putRequest.onsuccess = () => resolve(updatedChat);
      };
    });
  }

  async getAllChats() {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([CHATS_STORE], "readonly");
      const store = transaction.objectStore(CHATS_STORE);
      const request = store.index("timestamp").getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result.reverse());
    });
  }

  async deleteChat(id) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([CHATS_STORE], "readwrite");
      const store = transaction.objectStore(CHATS_STORE);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}
