/*
(c) Meher Mankar
See the LICENSE file in the project root.
*/

import type { ServerResponse } from "node:http";
import { getUrl } from "./_mongo";
import { sendJson, type ApiRequest } from "./_types";

export default async function handler(
  request: ApiRequest,
  response: ServerResponse,
): Promise<void> {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return sendJson(response, 405, { error: "Method not allowed." });
  }

  const hash = request.query.hash;
  if (typeof hash !== "string" || !/^[0-9a-z]{8}$/.test(hash)) {
    return sendJson(response, 404, { error: "Short link not found." });
  }

  try {
    const url = await getUrl(hash);
    if (!url) {
      return sendJson(response, 404, { error: "Short link not found." });
    }

    response.setHeader("Location", url);
    response.statusCode = 302;
    response.end();
  } catch (error) {
    console.error(`Unable to resolve short link ${hash}:`, error);
    return sendJson(response, 500, {
      error: "Unable to resolve this short link. Please try again.",
    });
  }
}
