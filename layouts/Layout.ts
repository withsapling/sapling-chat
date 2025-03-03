import {
  Layout as SaplingLayout,
  html,
  type LayoutProps,
} from "@sapling/sapling";
import { BaseHead } from "../components/BaseHead.ts";
import { config } from "../uno.config.ts";

export type BaseLayoutProps = LayoutProps & {
  title?: string;
  description?: string;
};

export default async function Layout(props: BaseLayoutProps) {
  return await SaplingLayout({
    stream: true,
    enableIslands: true,
    unoConfig: config,
    head: html`${await BaseHead({
      title: props.title,
      description: props.description,
    })}
    ${await props.head}`,
    bodyClass: `font-sans bg-background text-on-background ${
      props.bodyClass ?? ``
    }`,
    children: html`${props.children} `,
  });
}
