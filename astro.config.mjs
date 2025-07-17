// @ts-check
import { defineConfig } from "astro/config";

import partytown from "@astrojs/partytown";

// https://astro.build/config
export default defineConfig({
  site: "https://can-taslicukur.github.io",
  integrations: [partytown()],
});