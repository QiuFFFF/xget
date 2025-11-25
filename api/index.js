/**
 * Xget - High-performance acceleration engine for developer resources
 * Copyright (C) 2025 Xi Xu
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { handleRequest } from '../src/index.js';

/**
 * Vercel Edge Function handler for all routes.
 *
 * This adapter enables Xget to run on Vercel's Edge Runtime by mapping
 * Vercel's environment model to Cloudflare Workers' expected format.
 *
 * The Vercel Edge Runtime uses standard Web APIs (Request, Response, fetch),
 * making it compatible with the existing Cloudflare Workers code.
 *
 * @param {Request} request - Standard Web API Request
 * @returns {Promise<Response>} Standard Web API Response
 *
 * @example
 * // This is called automatically by Vercel Edge Runtime
 * // Runtime invokes: handler(request)
 * // Returns: Response with proxied content
 *
 * @example
 * // Environment variables usage
 * // Vercel dashboard or vercel.json: TIMEOUT_SECONDS = "60"
 * // process.env contains: { TIMEOUT_SECONDS: "60" }
 * // Mapped to env object and passed to handleRequest
 */
export default async function handler(request) {
  // Map process.env to Cloudflare Workers env format
  const env = {
    TIMEOUT_SECONDS: process.env.TIMEOUT_SECONDS,
    MAX_RETRIES: process.env.MAX_RETRIES,
    RETRY_DELAY_MS: process.env.RETRY_DELAY_MS,
    CACHE_DURATION: process.env.CACHE_DURATION,
    ALLOWED_METHODS: process.env.ALLOWED_METHODS,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
    MAX_PATH_LENGTH: process.env.MAX_PATH_LENGTH,
  };

  // Create minimal execution context
  // Note: Vercel Edge Runtime doesn't support waitUntil or passThroughOnException
  const ctx = {
    waitUntil: (promise) => {
      // No-op: Vercel doesn't support background tasks
      // Cache writes will run synchronously instead
      console.warn('waitUntil is not supported in Vercel Edge Runtime');
    },
    passThroughOnException: () => {
      // No-op: Vercel-specific error handling
      console.warn('passThroughOnException is not supported in Vercel Edge Runtime');
    }
  };

  // Delegate to the main request handler
  return handleRequest(request, env, ctx);
}

// Vercel Edge Runtime configuration
export const config = {
  runtime: 'edge',
};
