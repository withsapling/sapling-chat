import { marked } from "marked";
import markedShiki from "marked-shiki";
import { highlightCodeBlock, initializeHighlighter } from "./shikiStream.js";

let isInitialized = false;

/**
 * Renders markdown content with syntax highlighting
 * @param {string} markdown - The markdown content to render
 * @param {MarkdownOptions} [options={}] - Rendering options
 * @returns {Promise<string>} The rendered HTML
 */
export async function renderMarkdown(markdown, options = {}) {
  if (!markdown) return "";

  if (!isInitialized) {
    // Initialize shiki highlighter
    await initializeHighlighter({
      langs: options.langs || [
        "javascript",
        "typescript",
        "html",
        "css",
        "json",
        "markdown",
        "python",
        "go",
        "dart",
        "yaml",
        "sql",
        "bash",
      ],
      themes: [options.shikiOptions?.theme || "vitesse-dark"],
    });

    // Configure marked options
    await marked.use({
      gfm: options.gfm ?? true,
      breaks: options.breaks ?? false,
      sanitize: false,
      headerIds: true,
      mangle: false,
    });

    // Configure marked with Shiki for code blocks
    await marked.use(
      markedShiki({
        async highlight(code, lang) {
          return await highlightCodeBlock(code, lang, {
            theme: options.shikiOptions?.theme || "vitesse-dark",
          });
        },
        container: `<figure class="highlighted-code" style="position: relative;">
        <copy-code-button></copy-code-button>
        %s
        </figure>`,
      })
    );

    isInitialized = true;
  }

  try {
    // Render the markdown
    return await marked(markdown);
  } catch (error) {
    console.error("Markdown rendering error:", error);
    return markdown; // Fallback to plain text if rendering fails
  }
}

/**
 * Creates a stream that renders markdown content with syntax highlighting
 * Optimized for handling streaming LLM responses with code blocks
 * @param {ReadableStream<string>} textStream - The stream of markdown text
 * @param {MarkdownOptions} [options={}] - Rendering options
 * @returns {Promise<ReadableStream<string>>} A stream of HTML elements
 */
export async function createMarkdownRenderStream(textStream, options = {}) {
  if (!isInitialized) {
    await renderMarkdown("", options); // Initialize renderer
  }

  // Track incomplete code blocks
  let buffer = "";
  let inCodeBlock = false;
  let codeBlockLang = "";
  let codeBlockContent = "";

  // Create a transform stream for intelligent markdown chunking
  const processedStream = textStream.pipeThrough(
    new TransformStream({
      transform(chunk, controller) {
        // Add new text to buffer
        buffer += chunk;

        // Process buffer for complete elements
        let result = "";

        // Identify code blocks and handle them specially
        const lines = buffer.split("\n");
        let newBuffer = "";

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          // Check for code block markers
          if (line.startsWith("```")) {
            if (!inCodeBlock) {
              // Starting a new code block
              inCodeBlock = true;
              codeBlockLang = line.slice(3).trim();
              codeBlockContent = "";
            } else {
              // Ending a code block
              inCodeBlock = false;
              // Render the full code block with syntax highlighting
              result += `\n\`\`\`${codeBlockLang}\n${codeBlockContent}\n\`\`\`\n`;
              codeBlockLang = "";
              codeBlockContent = "";
            }
          } else if (inCodeBlock) {
            // Inside a code block, accumulate content
            codeBlockContent += line + "\n";
          } else {
            // Regular content outside code block
            result += line + "\n";
          }

          // If this is the last line and we're in a code block,
          // we need to keep all content in the buffer
          if (i === lines.length - 1 && inCodeBlock) {
            newBuffer = buffer;
            result = ""; // Clear result, we'll process this in the next chunk
          }
        }

        // Update buffer with any remaining incomplete content
        if (!inCodeBlock) {
          buffer = newBuffer || "";
        }

        // Send processed content to next step in pipeline
        if (result) {
          controller.enqueue(result);
        }
      },
    })
  );

  // Create a transform stream for markdown to HTML conversion
  return processedStream.pipeThrough(
    new TransformStream({
      async transform(chunk, controller) {
        try {
          // Process the markdown chunk
          const html = await marked(chunk);
          controller.enqueue(html);
        } catch (error) {
          console.error("Markdown streaming error:", error);
          controller.enqueue(chunk); // Fall back to raw text if error
        }
      },
    })
  );
}
