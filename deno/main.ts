/*
(c) Meher Mankar
See the LICENSE file in the project root.
*/

import { Application, Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { getUrl, shortenUrl } from "./database.ts";
import { validateDestinationUrl } from "../shared/validation.ts";

const router = new Router();

router.get("/:urlhash", async (context) => {
  const url = await getUrl(context.params.urlhash);
  if (!url) {
    context.response.status = 404;
    context.response.body = { error: "Short link not found." };
    return;
  }

  context.response.redirect(url);
});

router.post("/shorten", async (context) => {
  let data: unknown;
  try {
    data = await context.request.body({ type: "json" }).value;
  } catch {
    context.response.status = 400;
    context.response.body = { error: "Request body must be valid JSON." };
    return;
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    context.response.status = 400;
    context.response.body = { error: "Request body must be a JSON object." };
    return;
  }

  const url = (data as Record<string, unknown>).url;
  if (typeof url !== "string" || !validateDestinationUrl(url)) {
    context.response.status = 400;
    context.response.body = {
      error: "A valid HTTP or HTTPS URL is required (maximum 2048 characters).",
    };
    return;
  }

  const hash = await shortenUrl(url);
  context.response.body = { hash };
});

const app = new Application();

app.use(async (context, next) => {
  const pathname = context.request.url.pathname;
  const isStaticAsset = pathname === "/" ||
    pathname === "/styles.css" ||
    pathname === "/script.js" ||
    pathname.startsWith("/assets/");

  if (context.request.method === "GET" && isStaticAsset) {
    await context.send({ root: "./public/", index: "index.html" });
    return;
  }

  await next();
});

app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener("error", (event) => {
  console.error("Unhandled application error:", event);
});

const port = Number(Deno.env.get("PORT") ?? "8000");
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535.");
}
console.log(`Listening on port ${port}.`);

await app.listen({ port });
