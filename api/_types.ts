/*
(c) Meher Mankar
See the LICENSE file in the project root.
*/

import type { IncomingMessage, ServerResponse } from "node:http";

export interface ApiRequest extends IncomingMessage {
  body?: unknown;
  query: Record<string, string | string[] | undefined>;
}

export function sendJson(
  response: ServerResponse,
  status: number,
  data: unknown,
): void {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(data));
}
