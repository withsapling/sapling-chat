import { LitElement, html, css } from "lit";

export const copyIcon = html`<svg
  xmlns="http://www.w3.org/2000/svg"
  height="18px"
  viewBox="0 0 24 24"
  width="18px"
  fill="currentColor"
>
  <path d="M0 0h24v24H0z" fill="none" />
  <path
    d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
  />
</svg>`;

export const checkIcon = html`<svg
  xmlns="http://www.w3.org/2000/svg"
  height="18px"
  viewBox="0 0 24 24"
  width="18px"
  fill="currentColor"
>
  <path d="M0 0h24v24H0z" fill="none" />
  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
</svg>`;

export class CopyCodeButton extends LitElement {
  static styles = [
    css`
      :host {
        --copy-code-button-foreground: var(--color-foreground);
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
      }
      button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: fit-content;
        margin: 0;
        padding: 0.5rem;
        background: var(--color-background-muted);
        color: var(--copy-code-button-foreground);
        border: none;
        border-radius: 0.25rem;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s ease;
        opacity: 0.7;
      }

      button:hover {
        opacity: 1;
      }

      /* Color for the check icon when copied */
      button.copied {
        color: #4ade80; /* Green color for success state */
        opacity: 1;
      }
    `,
  ];

  constructor() {
    super();
    this._isCopied = false;
  }

  static get properties() {
    return {
      _isCopied: { type: Boolean },
    };
  }

  copyCode() {
    // Set copied state
    this._isCopied = true;
    this.requestUpdate();

    // Find the sibling pre element within the same figure
    const figure = this.closest("figure");
    if (!figure) return;

    const pre = figure.querySelector("pre");
    if (!pre) return;

    // Find the code element within the pre
    const code = pre.querySelector("code");
    if (!code) return;

    // Get the text content and preserve line breaks
    const codeText = code.innerText || code.textContent;

    // Use clipboard API with the text content directly
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(codeText)
        .catch((error) => console.error("Failed to copy:", error));
    } else {
      // Fallback to older method
      const textarea = document.createElement("textarea");
      textarea.value = codeText;
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
      } catch (err) {
        console.error("Failed to copy:", err);
      }
      document.body.removeChild(textarea);
    }

    // Reset copied state after delay
    setTimeout(() => {
      this._isCopied = false;
      this.requestUpdate();
    }, 2000);
  }
  render() {
    return html`
      <button
        @click=${this.copyCode}
        aria-label=${this._isCopied ? "Copied" : "Copy code"}
        title=${this._isCopied ? "Copied" : "Copy code"}
      >
        ${this._isCopied ? checkIcon : copyIcon}
      </button>
    `;
  }
}

customElements.define("copy-code-button", CopyCodeButton);
