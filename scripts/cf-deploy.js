#!/usr/bin/env node
// scripts/cf-deploy.js
// Cloudflare Pages sets CF_PAGES=1 during its own build/deploy pipeline.
// When that variable is present, the platform handles deployment automatically
// after the build command completes — running wrangler pages deploy here is
// both redundant and forbidden by the environment token.
// When running locally or via GitHub Actions, the full wrangler deploy runs.

/* global process */
import { execSync } from "child_process";

if (process.env.FORCE_WRANGLER_DEPLOY !== "1") {
  console.log(
    "[cf-deploy] Skipping wrangler deploy by default. Cloudflare Pages already deploys build output automatically. Set FORCE_WRANGLER_DEPLOY=1 to run manual wrangler deployment."
  );
  process.exit(0);
}

console.log("[cf-deploy] Running wrangler pages deploy...");
execSync("wrangler pages deploy dist --project-name beyond", {
  stdio: "inherit",
});
