import { html } from "@sapling/sapling";

export function BaseHead({
  title = "Sapling",
  description = "Sapling is a modern SSR framework for simpler modern websites",
}) {
  return html`
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta property="og:image" content="/social.png" />
    <meta name="theme-color" content="#000" />
    <script
      src="https://cdn.jsdelivr.net/npm/iconify-icon@2.1.0/dist/iconify-icon.min.js"
      defer
    ></script>
    <style>
      :root {
        --color-background: #fafafa;
        --color-on-background: #000;
        --color-primary: #000;
        --color-on-primary: #fff;
        --color-surface: #fff;
        --color-on-surface: #000;
        --color-secondary: #fff;
      }
      ::selection {
        background-color: var(--color-primary);
        color: var(--color-on-primary);
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --color-background: #1d1e20;
          --color-on-background: #fff;
          --color-primary: #fff;
          --color-on-primary: #000;
          --color-surface: #303030;
          --color-on-surface: #fff;
          --color-secondary: #000;
        }
      }
    </style>
  `;
}
