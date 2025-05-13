import { hydrate } from "preact";

declare const PAGE: string;

const { default: Page } = await import(PAGE);

hydrate(<Page />, document.body);