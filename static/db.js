const DB_NAME = "sapling-chat";
const DB_VERSION = 2;
const CHATS_STORE = "chats";

export class ChatDB {
  constructor() {
    this.db = null;
  }

  async init() {
    if (this.db) return;

    try {
      // Check if we're in a secure context
      const isSecureContext = window.isSecureContext;
      console.log("Secure context:", isSecureContext);
      console.log("Current origin:", window.location.origin);

      // Request persistence with more robust error handling
      if (navigator.storage && navigator.storage.persist) {
        try {
          // First check if already persisted
          let isPersisted = await navigator.storage.persisted();

          if (!isPersisted) {
            // If not persisted, request it
            isPersisted = await navigator.storage.persist();
            console.log(`Storage persistence request result:`, isPersisted);
          }

          if (!isPersisted) {
            // If still not persisted, show warning to user
            const warning = document.createElement("div");
            warning.style.cssText =
              "position: fixed; top: 0; left: 50%; transform: translateX(-50%); background: #fff3cd; color: #856404; padding: 8px 16px; border-radius: 4px; z-index: 1000; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin: 8px;";
            warning.textContent =
              "⚠️ Chat history may not persist between sessions due to browser storage limitations";
            document.body.appendChild(warning);
            setTimeout(() => warning.remove(), 5000);
          }

          // Get storage estimate
          const estimate = await navigator.storage.estimate();
          const usedPercentage = (
            (estimate.usage / estimate.quota) *
            100
          ).toFixed(2);
          console.log(
            `Storage estimate - Used: ${usedPercentage}% (${estimate.usage} bytes / ${estimate.quota} bytes)`
          );
        } catch (storageError) {
          console.warn("Storage persistence request failed:", storageError);
        }
      }

      return new Promise((resolve, reject) => {
        console.log("Opening IndexedDB:", DB_NAME, "version:", DB_VERSION);
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
          console.error("IndexedDB error:", event.target.error);
          reject(request.error);
        };

        request.onsuccess = (event) => {
          this.db = event.target.result;

          // Log database info
          console.log("IndexedDB opened successfully:", {
            name: this.db.name,
            version: this.db.version,
            objectStoreNames: Array.from(this.db.objectStoreNames),
          });

          // Add error handler for database
          this.db.onerror = (event) => {
            console.error("Database error:", event.target.error);
          };

          resolve();
        };

        request.onupgradeneeded = (event) => {
          console.log("Database upgrade needed");
          const db = event.target.result;
          if (!db.objectStoreNames.contains(CHATS_STORE)) {
            const store = db.createObjectStore(CHATS_STORE, { keyPath: "id" });
            store.createIndex("timestamp", "timestamp", { unique: false });
            console.log("Created chats store with timestamp index");
          }
        };

        request.onblocked = (event) => {
          console.warn(
            "Database upgrade blocked. Please close other tabs running the app."
          );
        };
      });
    } catch (error) {
      console.error("Critical database error:", error);
      throw error;
    }
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
