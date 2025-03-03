export class ModelSelector {
  constructor() {
    this.modelSelectorButton = document.getElementById("model-selector-button");
    this.modelDropdown = document.getElementById("model-dropdown");
    this.selectedModelName = document.getElementById("selected-model-name");
    this.thinkToggle = document.getElementById("think-toggle");
    this.previousModel = null;

    if (
      !this.modelSelectorButton ||
      !this.modelDropdown ||
      !this.selectedModelName ||
      !this.thinkToggle
    ) {
      console.error("Required model selector elements not found");
      return;
    }

    this.init();
  }

  init() {
    // Initialize with stored or default model
    const currentModel = this.getCurrentModel();
    this.updateSelectedModel(currentModel);

    // Handle think toggle
    this.thinkToggle.addEventListener("click", () => {
      const isThinking = this.thinkToggle.classList.toggle("active");
      this.thinkToggle.classList.toggle("bg-black", isThinking);
      this.thinkToggle.classList.toggle("@dark:bg-white", isThinking);
      this.thinkToggle.classList.toggle("text-white", isThinking);
      this.thinkToggle.classList.toggle("@dark:text-black", isThinking);

      if (isThinking) {
        this.previousModel = this.getCurrentModel();
        this.updateSelectedModel("gemini-2.0-flash-thinking-exp-01-21");
        this.setCurrentModel("gemini-2.0-flash-thinking-exp-01-21");
      } else {
        const modelToRestore = this.previousModel || "gemini-2.0-flash-lite";
        this.updateSelectedModel(modelToRestore);
        this.setCurrentModel(modelToRestore);
      }
    });

    // Handle model selector click
    this.modelSelectorButton.addEventListener("click", (e) => {
      e.stopPropagation();
      this.modelDropdown.classList.toggle("hidden");

      // Close dropdown when clicking outside
      const closeDropdown = (e) => {
        if (
          !this.modelDropdown.contains(e.target) &&
          !this.modelSelectorButton.contains(e.target)
        ) {
          this.modelDropdown.classList.add("hidden");
          document.removeEventListener("click", closeDropdown);
        }
      };

      document.addEventListener("click", closeDropdown);
    });

    // Handle model selection
    this.modelDropdown.addEventListener("click", (e) => {
      const modelButton = e.target.closest("[data-model-id]");
      if (modelButton) {
        const modelId = modelButton.dataset.modelId;
        this.updateSelectedModel(modelId);
        this.setCurrentModel(modelId);
        this.modelDropdown.classList.add("hidden");
      }
    });
  }

  getCurrentModel() {
    return localStorage.getItem("selected_model") || "gemini-2.0-flash-lite";
  }

  setCurrentModel(modelId) {
    localStorage.setItem("selected_model", modelId);
  }

  updateSelectedModel(modelId) {
    const modelButtons = this.modelDropdown.querySelectorAll("[data-model-id]");
    modelButtons.forEach((button) => {
      const isSelected = button.dataset.modelId === modelId;
      button.dataset.selected = isSelected;
      if (isSelected && this.selectedModelName) {
        this.selectedModelName.textContent =
          button.querySelector(".font-medium").textContent;
      }
    });
  }
}
