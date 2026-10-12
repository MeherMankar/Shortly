/*
(c) Meher Mankar
See the LICENSE file in the project root.
*/

import type { ServerResponse } from "node:http";
import { shortenUrl } from "./_mongo.js";
import { sendJson, type ApiRequest } from "./_types.js";
import { validateDestinationUrl } from "../shared/validation.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export default async function handler(
  request: ApiRequest,
  response: ServerResponse,
): Promise<void> {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return sendJson(response, 405, { error: "Method not allowed." });
  }

  let data: unknown = request.body;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      return sendJson(response, 400, {
        error: "Request body must be valid JSON.",
      });
    }
  }

  if (!isRecord(data)) {
    return sendJson(response, 400, {
      error: "Request body must be a JSON object.",
    });
  }

  const url = data.url;
  if (typeof url !== "string" || !validateDestinationUrl(url)) {
    return sendJson(response, 400, {
      error: "A valid HTTP or HTTPS URL is required (maximum 2048 characters).",
    });
  }

  try {
    const hash = await shortenUrl(url);
    return sendJson(response, 200, { hash });
  } catch (error) {
    console.error("Unable to shorten URL:", error);
    return sendJson(response, 500, {
      error: "Unable to shorten this URL. Please try again.",
    });
  }
}
