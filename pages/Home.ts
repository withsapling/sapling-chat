import { html } from "@sapling/sapling";
import Layout from "../layouts/Layout.ts";
import { ChatList } from "../components/ChatList.ts";

export async function Home() {
  return await Layout({
    title: "Sapling Chat",
    description: "An open source chat app built with Sapling",
    head: html` <script type="module" src="/db.js"></script> `,
    children: html`${ChatList()}`,
  });
}
