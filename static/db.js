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

      // Request persistence first
      if (navigator.storage && navigator.storage.persist) {
        const isPersisted = await navigator.storage.persist();
        console.log(`Storage persistence granted:`, isPersisted);

        // Check current persistence state
        const persistState = await navigator.storage.persisted();
        console.log("Current storage persistence state:", persistState);

        // Check storage estimate
        const estimate = await navigator.storage.estimate();
        console.log("Storage estimate:", estimate);
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

      transaction.oncomplete = () => {
        resolve(chat);
      };

      transaction.onerror = () => {
        reject(transaction.error);
      };

      const store = transaction.objectStore(CHATS_STORE);
      store.add(chat);
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

      transaction.oncomplete = () => {
        resolve(updates);
      };

      transaction.onerror = () => {
        reject(transaction.error);
      };

      const store = transaction.objectStore(CHATS_STORE);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const existingChat = getRequest.result || {
          id,
          messages: [],
          timestamp: Date.now(),
          title: "New Chat",
        };

        const updatedChat = {
          ...existingChat,
          ...updates,
          messages: updates.messages || existingChat.messages || [],
          timestamp: Date.now(),
        };

        store.put(updatedChat);
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
