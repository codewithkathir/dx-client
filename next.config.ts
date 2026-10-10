import fs from "node:fs";
import path from "node:path";
import { parseEnv } from "node:util";
import type { NextConfig } from "next";
import { PHASE_PRODUCTION_SERVER } from "next/constants";

/**
 * Runtime environment selection (APP_ENV, default "local"):
 * - local: localhost defaults from src/config/env.config.ts (.env.local may override).
 * - dev / qa: values from .env.dev / .env.qa, or from the process environment
 *   when that file is absent (e.g. CI). Missing required values fail the build.
 *
 * NEXT_PUBLIC_* values are inlined at build time, so build with the target
 * environment: `npm run build:dev` / `npm run build:qa`.
 */
const APP_ENVS = ["local", "dev", "qa"] as const;
const REQUIRED_REMOTE_ENV = ["NEXT_PUBLIC_API_URL"] as const;

function resolveAppEnv(): (typeof APP_ENVS)[number] {
  const value = process.env.APP_ENV ?? "local";
  if (!(APP_ENVS as readonly string[]).includes(value)) {
    throw new Error(`Invalid APP_ENV "${value}". Expected one of: ${APP_ENVS.join(", ")}`);
  }
  return value as (typeof APP_ENVS)[number];
}

function loadRemoteEnv(appEnv: (typeof APP_ENVS)[number]): void {
  const envFile = path.join(process.cwd(), `.env.${appEnv}`);
  if (fs.existsSync(envFile)) {
    // The env file is authoritative for dev/qa, so it overrides anything
    // Next.js already loaded from .env / .env.local.
    Object.assign(process.env, parseEnv(fs.readFileSync(envFile, "utf8")));
  }

  const missing = REQUIRED_REMOTE_ENV.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `APP_ENV=${appEnv}: missing ${missing.join(", ")}. ` +
        `Set them in .env.${appEnv} (see .env.${appEnv}.example) or in the environment.`,
    );
  }
}

export default function nextConfig(phase: string): NextConfig {
  const appEnv = resolveAppEnv();

  // `next start` serves a bundle whose NEXT_PUBLIC_* values were inlined at
  // build time, so only `next build` / `next dev` need to load and validate.
  if (appEnv !== "local" && phase !== PHASE_PRODUCTION_SERVER) {
    loadRemoteEnv(appEnv);
  }

  const publicEnv: Record<string, string> = { NEXT_PUBLIC_APP_ENV: appEnv };
  for (const key of ["NEXT_PUBLIC_API_URL", "NEXT_PUBLIC_APP_NAME"] as const) {
    const value = process.env[key];
    if (value) publicEnv[key] = value;
  }

  return {
    // Standalone bundle for VPS / PM2 (see deploy/DEPLOYMENT.md)
    output: "standalone",
    allowedDevOrigins: ['*',"app.dxrecord.com", ".dxrecord.com"],
    env: publicEnv,
    // Don't advertise the framework in responses.
    poweredByHeader: false,
    // Browser security headers for every page (the API sets its own via helmet).
    headers() {
      return [
        {
          source: "/:path*",
          headers: [
            // Never render inside another site's frame (clickjacking).
            { key: "X-Frame-Options", value: "DENY" },
            { key: "Content-Security-Policy", value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'" },
            { key: "X-Content-Type-Options", value: "nosniff" },
            { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
            // Camera stays available to this site for receipt photos; nothing else is needed.
            { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), payment=()" },
            ...(appEnv === "local"
              ? []
              : [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }]),
          ],
        },
      ];
    },
  };
}
