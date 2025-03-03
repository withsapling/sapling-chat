import { createHighlighter, createJavaScriptRegexEngine } from "shiki";
import { CodeToTokenTransformStream } from "shiki-stream";

let highlighter = null;

/**
 * Initialize the Shiki highlighter
 * @param {Object} options - Highlighter options
 * @returns {Promise<void>}
 */
export async function initializeHighlighter(options = {}) {
  highlighter = await createHighlighter({
    langs: options.langs || [
      "javascript",
      "typescript",
      "html",
      "css",
      "json",
      "markdown",
      "python",
    ],
    themes: options.themes || ["vitesse-dark"],
    engine: createJavaScriptRegexEngine(),
  });
}

/**
 * Create a stream transformer for code highlighting
 * @param {Object} options - Options for the transformer
 * @returns {CodeToTokenTransformStream} A transform stream for code highlighting
 */
export function createCodeHighlightStream(options = {}) {
  if (!highlighter) {
    throw new Error(
      "Highlighter not initialized. Call initializeHighlighter first."
    );
  }

  return new CodeToTokenTransformStream({
    highlighter,
    lang: options.lang || "text",
    theme: options.theme || "vitesse-dark",
    allowRecalls:
      options.allowRecalls !== undefined ? options.allowRecalls : true,
  });
}

/**
 * Create a render stream for highlighted code
 * This combines the token stream with HTML rendering
 * @param {ReadableStream<string>} textStream - The stream of text to highlight
 * @param {Object} options - Options for highlighting
 * @returns {ReadableStream<string>} A stream of HTML elements
 */
export function createCodeRenderStream(textStream, options = {}) {
  const tokenStream = textStream.pipeThrough(
    createCodeHighlightStream(options)
  );

  // Transform tokens to HTML elements
  return new TransformStream({
    start(controller) {
      controller.enqueue('<pre class="shiki-stream"><code>');
      this.receivedTokens = [];
    },
    transform(token, controller) {
      if ("recall" in token) {
        // Handle recalls by removing the last n tokens
        this.receivedTokens.length -= token.recall;
        // Re-render all tokens
        controller.enqueue('</code></pre><pre class="shiki-stream"><code>');
        for (const t of this.receivedTokens) {
          const span = `<span style="color: ${t.color}">${t.content}</span>`;
          controller.enqueue(span);
        }
      } else {
        this.receivedTokens.push(token);
        const span = `<span style="color: ${token.color}">${token.content}</span>`;
        controller.enqueue(span);
      }
    },
    flush(controller) {
      controller.enqueue("</code></pre>");
    },
  });
}

/**
 * Highlights a code block with streaming capabilities
 * @param {string} code - The code to highlight
 * @param {string} lang - The language of the code
 * @param {Object} options - Options for highlighting
 * @returns {Promise<string>} The highlighted HTML
 */
export async function highlightCodeBlock(code, lang, options = {}) {
  if (!highlighter) {
    await initializeHighlighter(options);
  }

  try {
    return await highlighter.codeToHtml(code, {
      lang: lang || "text",
      theme: options.theme || "vitesse-dark",
    });
  } catch (error) {
    console.error("Syntax highlighting error:", error);
    return `<pre><code class="language-${lang || "text"}">${code}</code></pre>`;
  }
}
