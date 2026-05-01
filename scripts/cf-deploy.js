#!/usr/bin/env node
// scripts/cf-deploy.js
// Cloudflare Pages sets CF_PAGES=1 during its own build/deploy pipeline.
// When that variable is present, the platform handles deployment automatically
// after the build command completes — running wrangler pages deploy here is
// both redundant and forbidden by the environment token.
// When running locally or via GitHub Actions, the full wrangler deploy runs.

/* global process */
import { execSync } from "child_process";

if (process.env.CF_PAGES === "1") {
  console.log(
    "[cf-deploy] Running inside Cloudflare Pages — skipping wrangler deploy (platform handles this automatically)."
  );
  process.exit(0);
}

console.log("[cf-deploy] Running wrangler pages deploy...");
execSync("wrangler pages deploy dist --project-name beyond", {
  stdio: "inherit",
});
